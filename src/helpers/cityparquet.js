/**
 * CityParquet reader for ninja.
 *
 * Reads one or more CityParquet object-table `.parquet` files (as produced by
 * cityparquet-rs) and reconstructs an in-memory CityJSON object that the rest of
 * ninja (and the cityjson-threejs-loader) can consume directly.
 *
 * Supported today:
 *  - the main city object table(s): id, object_type, parents/children hierarchy
 *  - typed attribute columns (everything that is not a reserved structural column)
 *  - WKB geometry (MultiPoint/MultiLineString/MultiPolygon/PolyhedralSurface/
 *    GeometryCollection), decoded back into CityJSON boundaries + a shared vertex pool
 *  - CityJSON semantics carried in the geometry_properties JSON column
 *  - multiple LoDs, encoded either as geometry_lod* columns or split across files
 *
 * Not yet handled (gracefully ignored): appearance sidecars (materials/textures)
 * and geometry template instances. Rows that only carry a template reference and
 * no WKB geometry will not be rendered.
 */

import initWasm, { readParquet } from 'parquet-wasm';
import { tableFromIPC } from 'apache-arrow';
import { readWKB } from './wkb.js';
import {
	WKB_POINT,
	WKB_LINESTRING,
	WKB_POLYGON,
	WKB_TRIANGLE,
	WKB_MULTIPOINT,
	WKB_MULTILINESTRING,
	WKB_MULTIPOLYGON,
	WKB_POLYHEDRALSURFACE,
	WKB_TIN,
	WKB_GEOMETRYCOLLECTION
} from './wkb.js';

// Structural columns defined by the CityParquet spec. Everything else on a row
// is treated as a (typed) source attribute.
const RESERVED_COLUMNS = new Set( [
	'id',
	'feature_id',
	'object_type',
	'parents',
	'children',
	'children_roles',
	'bbox',
	'material',
	'texture',
	'template',
	'other'
] );

// Sidecar files are not object tables; skip them when scanning uploaded files.
const SIDECAR_NAMES = new Set( [
	'materials.parquet',
	'textures.parquet',
	'geometry_templates.parquet'
] );

const GEOMETRY_RE = /^geometry(_lod(.+))?$/;
const GEOMETRY_PROPS_RE = /^geometry_properties(_lod(.+))?$/;

// Quantisation used when packing real-world WKB coordinates into the CityJSON
// vertex array. Matching the CityJSON convention (small integer vertices + a
// transform) keeps coordinates within Float32 exact-integer range so the viewer
// does not jitter for datasets in large projected CRSs.
const QUANT_SCALE = 0.001;

let wasmReady = null;

function ensureWasm() {

	if ( ! wasmReady ) {

		// The browser (ESM) build exposes an async initialiser as its default
		// export; the Node (CommonJS) build loads the wasm eagerly and has no
		// such initialiser, so only call it when it is actually a function.
		wasmReady = typeof initWasm === 'function' ? Promise.resolve( initWasm() ) : Promise.resolve();

	}

	return wasmReady;

}

export class CityParquetUtils {

	static isCityParquetFile( fileName ) {

		return fileName.toLowerCase().endsWith( '.parquet' );

	}

	/**
	 * Converts a list of uploaded CityParquet files into a CityJSON object.
	 *
	 * @param {Array<{name:string, buffer:ArrayBuffer}>} files
	 * @returns {Promise<Object>} CityJSON city model
	 */
	async toCityJSON( files ) {

		await ensureWasm();

		const vertexPool = new VertexPool();
		const cityObjects = {};
		let sourceMetadata = null;
		let crs = null;
		let version = null;
		let skippedTemplates = 0;

		for ( const file of files ) {

			const baseName = file.name.split( /[\\/]/ ).pop().toLowerCase();
			if ( SIDECAR_NAMES.has( baseName ) ) {

				continue;

			}

			const table = tableFromIPC( readParquet( new Uint8Array( file.buffer ) ).intoIPCStream() );

			// Skip anything that is clearly not a main object table.
			if ( table.getChild( 'id' ) === null || table.getChild( 'object_type' ) === null ) {

				continue;

			}

			const meta = readSchemaMetadata( table.schema );
			if ( meta.source_metadata && sourceMetadata === null ) {

				sourceMetadata = safeJsonParse( meta.source_metadata );

			}

			if ( meta.crs && crs === null ) {

				crs = meta.crs;

			}

			if ( meta.cityparquet_version && version === null ) {

				version = meta.cityparquet_version;

			}

			skippedTemplates += this._readTable( table, vertexPool, cityObjects );

		}

		const { vertices, transform } = vertexPool.finalise();

		const citymodel = {
			type: 'CityJSON',
			version: '2.0',
			transform,
			CityObjects: cityObjects,
			vertices
		};

		const metadata = {};
		if ( sourceMetadata && typeof sourceMetadata === 'object' ) {

			Object.assign( metadata, sourceMetadata );

		}

		const referenceSystem = crsToReferenceSystem( crs );
		if ( referenceSystem ) {

			metadata.referenceSystem = referenceSystem;

		}

		if ( Object.keys( metadata ).length > 0 ) {

			citymodel.metadata = metadata;

		}

		if ( skippedTemplates > 0 ) {

			// eslint-disable-next-line no-console
			console.warn( `CityParquet: ${skippedTemplates} geometry-template instance(s) were not rendered (not yet supported).` );

		}

		return citymodel;

	}

	/**
	 * Reads a single object table into the shared vertex pool and CityObjects map.
	 * Returns the number of template-only rows that could not be rendered.
	 */
	_readTable( table, vertexPool, cityObjects ) {

		const numRows = table.numRows;

		const idVec = table.getChild( 'id' );
		const typeVec = table.getChild( 'object_type' );
		const parentsVec = table.getChild( 'parents' );
		const childrenVec = table.getChild( 'children' );
		const templateVec = table.getChild( 'template' );

		// Discover the geometry / geometry_properties column pairs (one per LoD).
		const geometryColumns = [];
		const attributeColumns = [];

		for ( const field of table.schema.fields ) {

			const name = field.name;

			if ( GEOMETRY_RE.test( name ) ) {

				const lod = GEOMETRY_RE.exec( name )[ 2 ];
				geometryColumns.push( {
					lod: lod !== undefined ? lod : null,
					geomVec: table.getChild( name ),
					propsVec: table.getChild( lod !== undefined ? `geometry_properties_lod${lod}` : 'geometry_properties' )
				} );

			} else if ( GEOMETRY_PROPS_RE.test( name ) || RESERVED_COLUMNS.has( name ) ) {

				// structural column, handled explicitly

			} else {

				attributeColumns.push( { name, vec: table.getChild( name ) } );

			}

		}

		let skippedTemplates = 0;

		for ( let i = 0; i < numRows; i ++ ) {

			const id = stringValue( idVec.get( i ) );
			if ( id === null ) {

				continue;

			}

			const cityObject = {
				type: stringValue( typeVec.get( i ) ) || 'GenericCityObject'
			};

			const parents = arrowValueToJs( parentsVec ? parentsVec.get( i ) : null );
			if ( Array.isArray( parents ) && parents.length > 0 ) {

				cityObject.parents = parents.map( String );

			}

			const children = arrowValueToJs( childrenVec ? childrenVec.get( i ) : null );
			if ( Array.isArray( children ) && children.length > 0 ) {

				cityObject.children = children.map( String );

			}

			const attributes = {};
			for ( const col of attributeColumns ) {

				const value = arrowValueToJs( col.vec ? col.vec.get( i ) : null );
				if ( value !== null && value !== undefined ) {

					attributes[ col.name ] = value;

				}

			}

			if ( Object.keys( attributes ).length > 0 ) {

				cityObject.attributes = attributes;

			}

			const geometry = [];
			for ( const geomCol of geometryColumns ) {

				const wkb = geomCol.geomVec ? geomCol.geomVec.get( i ) : null;
				if ( ! wkb ) {

					continue;

				}

				const props = geomCol.propsVec ? safeJsonParse( stringValue( geomCol.propsVec.get( i ) ) ) : null;
				const geom = buildGeometry( wkb, props, geomCol.lod, vertexPool );
				if ( geom ) {

					geometry.push( geom );

				}

			}

			if ( geometry.length > 0 ) {

				cityObject.geometry = geometry;

			} else if ( templateVec && templateVec.get( i ) ) {

				skippedTemplates ++;

			}

			cityObjects[ id ] = cityObject;

		}

		return skippedTemplates;

	}

}

/**
 * Collects coordinates into a shared, deduplicated pool and finalises them into
 * quantised integer CityJSON vertices plus a matching transform.
 */
class VertexPool {

	constructor() {

		this.coords = [];
		this.index = new Map();

	}

	push( x, y, z ) {

		const key = `${x},${y},${z}`;
		let idx = this.index.get( key );
		if ( idx === undefined ) {

			idx = this.coords.length;
			this.coords.push( [ x, y, z ] );
			this.index.set( key, idx );

		}

		return idx;

	}

	finalise() {

		if ( this.coords.length === 0 ) {

			return {
				vertices: [],
				transform: { scale: [ 1, 1, 1 ], translate: [ 0, 0, 0 ] }
			};

		}

		let minX = Infinity, minY = Infinity, minZ = Infinity;
		for ( const c of this.coords ) {

			if ( c[ 0 ] < minX ) minX = c[ 0 ];
			if ( c[ 1 ] < minY ) minY = c[ 1 ];
			if ( c[ 2 ] < minZ ) minZ = c[ 2 ];

		}

		const vertices = this.coords.map( c => [
			Math.round( ( c[ 0 ] - minX ) / QUANT_SCALE ),
			Math.round( ( c[ 1 ] - minY ) / QUANT_SCALE ),
			Math.round( ( c[ 2 ] - minZ ) / QUANT_SCALE )
		] );

		return {
			vertices,
			transform: {
				scale: [ QUANT_SCALE, QUANT_SCALE, QUANT_SCALE ],
				translate: [ minX, minY, minZ ]
			}
		};

	}

}

/**
 * Builds a CityJSON geometry object from a WKB blob and its geometry_properties.
 */
function buildGeometry( wkb, props, columnLod, vertexPool ) {

	let normalised;
	try {

		normalised = readWKB( wkb, ( x, y, z ) => vertexPool.push( x, y, z ) );

	} catch ( e ) {

		// eslint-disable-next-line no-console
		console.warn( 'CityParquet: failed to decode WKB geometry -', e.message );
		return null;

	}

	const cityType = ( props && props.type ) || inferCityType( normalised.type );
	const boundaries = wkbToBoundaries( normalised, cityType );

	if ( ! boundaries || boundaries.length === 0 ) {

		return null;

	}

	const geometry = {
		type: cityType,
		boundaries
	};

	const lod = ( props && props.lod !== undefined ) ? props.lod : columnLod;
	if ( lod !== undefined && lod !== null ) {

		geometry.lod = lod;

	}

	if ( props && props.semantics ) {

		geometry.semantics = props.semantics;

	}

	if ( props && props.material ) {

		geometry.material = props.material;

	}

	return geometry;

}

function inferCityType( wkbType ) {

	switch ( wkbType ) {

		case WKB_MULTIPOLYGON:
		case WKB_POLYGON:
		case WKB_TRIANGLE:
			return 'MultiSurface';
		case WKB_POLYHEDRALSURFACE:
		case WKB_TIN:
			return 'Solid';
		case WKB_GEOMETRYCOLLECTION:
			return 'CompositeSolid';
		case WKB_MULTIPOINT:
		case WKB_POINT:
			return 'MultiPoint';
		case WKB_MULTILINESTRING:
		case WKB_LINESTRING:
			return 'MultiLineString';
		default:
			return 'MultiSurface';

	}

}

/**
 * Converts the index-based WKB structure into CityJSON boundaries for the given
 * CityJSON geometry type.
 */
function wkbToBoundaries( normalised, cityType ) {

	const category = cityTypeCategory( cityType );
	const type = normalised.type;
	const value = normalised.value;

	if ( category === 'points' ) {

		return type === WKB_POINT ? [ value ] : value;

	}

	if ( category === 'lines' ) {

		return type === WKB_LINESTRING ? [ value ] : value;

	}

	if ( category === 'surfaces' ) {

		if ( type === WKB_MULTIPOLYGON || type === WKB_POLYHEDRALSURFACE || type === WKB_TIN ) {

			return value; // already an array of polygons/faces

		}

		if ( type === WKB_POLYGON || type === WKB_TRIANGLE ) {

			return [ value ]; // single surface

		}

		return [];

	}

	if ( category === 'solid' ) {

		if ( type === WKB_POLYHEDRALSURFACE || type === WKB_TIN || type === WKB_MULTIPOLYGON ) {

			return [ value ]; // one exterior shell of faces

		}

		if ( type === WKB_GEOMETRYCOLLECTION && value.length > 0 ) {

			return [ solidFacesOf( value[ 0 ] ) ];

		}

		return [];

	}

	if ( category === 'solids' ) {

		if ( type === WKB_GEOMETRYCOLLECTION ) {

			return value.map( member => [ solidFacesOf( member ) ] );

		}

		if ( type === WKB_POLYHEDRALSURFACE || type === WKB_TIN || type === WKB_MULTIPOLYGON ) {

			return [[ value ]]; // a single solid

		}

		return [];

	}

	return [];

}

function solidFacesOf( member ) {

	// A solid member is a PolyhedralSurface (list of faces) or, defensively, a
	// MultiPolygon. Both normalise to a list of polygon faces.
	if ( member && Array.isArray( member.value ) ) {

		return member.value;

	}

	return [];

}

function cityTypeCategory( cityType ) {

	switch ( cityType ) {

		case 'MultiSurface':
		case 'CompositeSurface':
			return 'surfaces';
		case 'Solid':
			return 'solid';
		case 'MultiSolid':
		case 'CompositeSolid':
			return 'solids';
		case 'MultiPoint':
			return 'points';
		case 'MultiLineString':
			return 'lines';
		default:
			return 'surfaces';

	}

}

// ---------------------------------------------------------------------------
// Arrow value helpers
// ---------------------------------------------------------------------------

function arrowValueToJs( value ) {

	if ( value === null || value === undefined ) {

		return null;

	}

	if ( typeof value === 'bigint' ) {

		return Number( value );

	}

	if ( value instanceof Date ) {

		return value.toISOString();

	}

	if ( value instanceof Uint8Array ) {

		return value;

	}

	// Arrow list element -> vector-like with iterator
	if ( typeof value.toArray === 'function' ) {

		return Array.from( value ).map( arrowValueToJs );

	}

	// Arrow struct row proxy
	if ( typeof value === 'object' && typeof value.toJSON === 'function' ) {

		const obj = value.toJSON();
		const result = {};
		for ( const k in obj ) {

			result[ k ] = arrowValueToJs( obj[ k ] );

		}

		return result;

	}

	return value;

}

function stringValue( value ) {

	if ( value === null || value === undefined ) {

		return null;

	}

	return String( value );

}

function readSchemaMetadata( schema ) {

	const result = {};
	if ( schema && schema.metadata ) {

		for ( const [ key, value ] of schema.metadata ) {

			result[ key ] = value;

		}

	}

	return result;

}

function safeJsonParse( text ) {

	if ( text === null || text === undefined ) {

		return null;

	}

	try {

		return JSON.parse( text );

	} catch ( e ) {

		return null;

	}

}

function crsToReferenceSystem( crs ) {

	if ( ! crs ) {

		return null;

	}

	const parsed = typeof crs === 'string' ? safeJsonParse( crs ) : crs;
	if ( parsed && parsed.id && parsed.id.authority && parsed.id.code !== undefined ) {

		return `https://www.opengis.net/def/crs/${parsed.id.authority}/0/${parsed.id.code}`;

	}

	// Fall back to storing whatever CRS string we were given.
	return typeof crs === 'string' ? crs : null;

}

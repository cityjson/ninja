/**
 * Minimal WKB (Well-Known Binary) reader tailored for CityParquet geometry.
 *
 * CityParquet stores geometry as 3D WKB in a BLOB column, following the
 * CityJSON -> WKB mapping described in the CityParquet specification:
 *
 *   MultiPoint       -> MultiPointZ
 *   MultiLineString  -> MultiLineStringZ
 *   MultiSurface     -> MultiPolygonZ
 *   CompositeSurface -> MultiPolygonZ
 *   Solid            -> PolyhedralSurfaceZ
 *   MultiSolid       -> GeometryCollectionZ
 *   CompositeSolid   -> GeometryCollectionZ
 *
 * This reader understands both the ISO WKB dimension convention (type codes
 * offset by 1000/2000/3000) and the EWKB flag convention (high bits on the
 * geometry type). Points are pushed to a caller-provided sink so that all
 * coordinates can be collected into a single shared vertex pool; the returned
 * structure references those vertices by index.
 */

// OGC geometry type codes (base, i.e. without dimension offset).
export const WKB_POINT = 1;
export const WKB_LINESTRING = 2;
export const WKB_POLYGON = 3;
export const WKB_MULTIPOINT = 4;
export const WKB_MULTILINESTRING = 5;
export const WKB_MULTIPOLYGON = 6;
export const WKB_GEOMETRYCOLLECTION = 7;
export const WKB_POLYHEDRALSURFACE = 15;
export const WKB_TIN = 16;
export const WKB_TRIANGLE = 17;

class Cursor {

	constructor( dataView ) {

		this.view = dataView;
		this.offset = 0;
		this.littleEndian = true;

	}

	readUint8() {

		const v = this.view.getUint8( this.offset );
		this.offset += 1;
		return v;

	}

	readUint32() {

		const v = this.view.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return v;

	}

	readDouble() {

		const v = this.view.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return v;

	}

}

/**
 * Parses a WKB geometry into an index-based structure.
 *
 * @param {ArrayBuffer|Uint8Array|DataView} buffer The WKB bytes.
 * @param {(x:number, y:number, z:number) => number} pushVertex Sink that stores
 *   a coordinate and returns its index in the shared vertex pool.
 * @returns {{ type:number, value:* }} Normalised geometry. `type` is the OGC
 *   base type; `value` shape depends on the type (see convertToBoundaries).
 */
export function readWKB( buffer, pushVertex ) {

	let view;
	if ( buffer instanceof DataView ) {

		view = buffer;

	} else if ( buffer instanceof Uint8Array ) {

		view = new DataView( buffer.buffer, buffer.byteOffset, buffer.byteLength );

	} else {

		view = new DataView( buffer );

	}

	const cursor = new Cursor( view );
	return readGeometry( cursor, pushVertex );

}

function readGeometry( cursor, pushVertex ) {

	cursor.littleEndian = cursor.readUint8() === 1;

	const rawType = cursor.readUint32();

	let hasZ = false;
	let hasM = false;
	let baseType;

	// EWKB uses high bits for Z/M/SRID; ISO WKB offsets the type by 1000/2000/3000.
	if ( ( rawType & 0x80000000 ) || ( rawType & 0x40000000 ) || ( rawType & 0x20000000 ) ) {

		hasZ = ( rawType & 0x80000000 ) !== 0;
		hasM = ( rawType & 0x40000000 ) !== 0;
		const hasSrid = ( rawType & 0x20000000 ) !== 0;
		baseType = rawType & 0xff;
		if ( hasSrid ) {

			cursor.readUint32(); // consume and ignore the SRID

		}

	} else {

		baseType = rawType % 1000;
		const dimFlag = Math.floor( rawType / 1000 );
		if ( dimFlag === 1 ) {

			hasZ = true;

		} else if ( dimFlag === 2 ) {

			hasM = true;

		} else if ( dimFlag === 3 ) {

			hasZ = true;
			hasM = true;

		}

	}

	const readCoord = () => {

		const x = cursor.readDouble();
		const y = cursor.readDouble();
		const z = hasZ ? cursor.readDouble() : 0;
		if ( hasM ) {

			cursor.readDouble(); // consume and ignore the measure value

		}

		return pushVertex( x, y, z );

	};

	switch ( baseType ) {

		case WKB_POINT:
			return { type: WKB_POINT, value: readCoord() };

		case WKB_LINESTRING: {

			const n = cursor.readUint32();
			const line = [];
			for ( let i = 0; i < n; i ++ ) {

				line.push( readCoord() );

			}

			return { type: WKB_LINESTRING, value: line };

		}

		case WKB_POLYGON:
		case WKB_TRIANGLE:
			return { type: baseType, value: readPolygonRings( cursor, readCoord ) };

		case WKB_MULTIPOINT: {

			const n = cursor.readUint32();
			const pts = [];
			for ( let i = 0; i < n; i ++ ) {

				pts.push( readGeometry( cursor, pushVertex ).value );

			}

			return { type: WKB_MULTIPOINT, value: pts };

		}

		case WKB_MULTILINESTRING: {

			const n = cursor.readUint32();
			const lines = [];
			for ( let i = 0; i < n; i ++ ) {

				lines.push( readGeometry( cursor, pushVertex ).value );

			}

			return { type: WKB_MULTILINESTRING, value: lines };

		}

		case WKB_MULTIPOLYGON: {

			const n = cursor.readUint32();
			const polygons = [];
			for ( let i = 0; i < n; i ++ ) {

				polygons.push( readGeometry( cursor, pushVertex ).value );

			}

			return { type: WKB_MULTIPOLYGON, value: polygons };

		}

		case WKB_POLYHEDRALSURFACE:
		case WKB_TIN: {

			const n = cursor.readUint32();
			const faces = [];
			for ( let i = 0; i < n; i ++ ) {

				faces.push( readGeometry( cursor, pushVertex ).value );

			}

			return { type: baseType, value: faces };

		}

		case WKB_GEOMETRYCOLLECTION: {

			const n = cursor.readUint32();
			const geoms = [];
			for ( let i = 0; i < n; i ++ ) {

				geoms.push( readGeometry( cursor, pushVertex ) );

			}

			return { type: WKB_GEOMETRYCOLLECTION, value: geoms };

		}

		default:
			throw new Error( `Unsupported WKB geometry type: ${baseType}` );

	}

}

/**
 * Reads polygon rings and drops the closing vertex of each ring, since CityJSON
 * boundaries are implicitly closed while WKB rings repeat the first point.
 */
function readPolygonRings( cursor, readCoord ) {

	const numRings = cursor.readUint32();
	const rings = [];

	for ( let r = 0; r < numRings; r ++ ) {

		const numPoints = cursor.readUint32();
		const ring = [];
		for ( let p = 0; p < numPoints; p ++ ) {

			ring.push( readCoord() );

		}

		// Drop the explicit closing point (WKB rings are closed, CityJSON's are not).
		if ( ring.length > 1 && ring[ 0 ] === ring[ ring.length - 1 ] ) {

			ring.pop();

		}

		rings.push( ring );

	}

	return rings;

}

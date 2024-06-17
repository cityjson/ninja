<template>
  <div
    id="viewer"
    class="col-12 px-0 h-100"
  ></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AttributeEvaluator, CityJSONLoader, CityJSONWorkerParser, TextureManager } from 'cityjson-threejs-loader';
import { SRGBColorSpace } from 'three';

export default {
	name: 'ThreeJsViewer',
	props: {
		citymodel: {
			type: Object,
			default: function () {

				return {};

			}
		},
		selectedObjid: {
			type: String,
			default: null
		},
		selectedGeomIdx: {
			type: Number,
			default: - 1,
		},
		selectedBoundaryIdx: {
			type: Number,
			default: - 1
		},
		highlightSelectedSurface: {
			type: Boolean,
			default: false
		},
		selectionColor: {
			type: Number,
			default: 0xffc107
		},
		objectColors: {
			type: Object,
			default: function () {

				return {
					"Building": 0x7497df,
					"BuildingPart": 0x7497df,
					"BuildingInstallation": 0x7497df,
					"Bridge": 0x999999,
					"BridgePart": 0x999999,
					"BridgeInstallation": 0x999999,
					"BridgeConstructionElement": 0x999999,
					"CityObjectGroup": 0xffffb3,
					"CityFurniture": 0xcc0000,
					"GenericCityObject": 0xcc0000,
					"LandUse": 0xffffb3,
					"PlantCover": 0x39ac39,
					"Railway": 0x000000,
					"Road": 0x999999,
					"SolitaryVegetationObject": 0x39ac39,
					"TINRelief": 0xffdb99,
					"TransportSquare": 0x999999,
					"Tunnel": 0x999999,
					"TunnelPart": 0x999999,
					"TunnelInstallation": 0x999999,
					"WaterBody": 0x4da6ff
				};

			}
		},
		surfaceColors: {
			type: Object,
			default: function () {

				return {
					"GroundSurface": 0x999999,
					"WallSurface": 0xffffff,
					"RoofSurface": 0xff0000,
					"TrafficArea": 0x6e6e6e,
					"AuxiliaryTrafficArea": 0x2c8200,
					"Window": 0x0059ff,
					"Door": 0x640000
				};

			}
		},
		backgroundColor: {
			type: Number,
			default: 0xd9eefc
		},
		showSemantics: {
			type: Boolean,
			default: true
		},
		activeLod: {
			type: Number,
			default: - 1
		},
		cameraSpotlight: {
			type: Boolean,
			default: true
		},
		conditionalFormatting: {
			type: Boolean,
			default: false
		},
		conditionalAttribute: {
			type: String,
			default: null
		},
		attributeColors: {
			type: Object,
			default: () => {}
		},
		activeMaterialTheme: {
			type: String,
			default: "undefined"
		},
		textureManager: {
			type: TextureManager,
			default: undefined
		},
		activeTextureTheme: {
			type: String,
			default: "undefined"
		},
	},
	data() {

		return {

			camera_init: true,
			lods: [],
			previousPos: {
				x: - 1,
				y: - 1
			},
			parser: null,

		};

	},
	watch: {
		backgroundColor: function ( newVal ) {

			this.renderer.setClearColor( newVal );

			this.updateScene();

		},
		objectColors: {
			handler: function () {

				this.refreshColors();
				this.updateScene();

			},
			deep: true
		},
		surfaceColors: {
			handler: function () {

				this.refreshColors();
				this.updateScene();

			},
			deep: true
		},
		selectionColor: function () {

			this.refreshColors();
			this.updateScene();

		},
		citymodel: {
			handler: function ( newCitymodel ) {

				this.clearScene();

				this.loadCitymodel( newCitymodel );

				this.updateScene();

			},
			deep: true
		},
		selectedObjid: function () {

			this.updateScene();

		},
		selectedGeomIdx: function () {

			this.updateScene();

		},
		selectedBoundaryIdx: function () {

			this.updateScene();

		},
		highlightSelectedSurface: function () {

			this.scene.traverse( c => {

				if ( c.material && c.material.isCityObjectsMaterial ) {

					c.material.selectSurface = this.highlightSelectedSurface;

				}

			} );

			this.updateScene();

		},
		showSemantics: function ( value ) {

			this.scene.traverse( c => {

				if ( c.material && c.material.isCityObjectsMaterial ) {

					c.material.showSemantics = value;

				}

			} );

			this.updateScene();

		},
		activeLod: function ( lodIdx ) {

			this.scene.traverse( c => {

				if ( c.material && c.material.isCityObjectsMaterial ) {

					c.material.showLod = lodIdx;

				}

			} );

			this.updateScene();

		},
		cameraSpotlight: function () {

			this.updateScene();

		},
		conditionalFormatting: function ( value ) {

			if ( this.conditionalAttribute == '' || this.conditionalAttribute === null ) {

				return;

			}

			this.scene.traverse( c => {

				if ( c.isCityObject ) {

					c.material.conditionalFormatting = value;

				}

			} );

			this.updateScene();

		},
		conditionalAttribute: function ( value ) {

			this.updateConditionalInfo();

			this.updateScene();

		},
		activeMaterialTheme: function ( theme ) {

			this.scene.traverse( c => {

				if ( c.supportsMaterials ) {

					c.material.materialTheme = theme;

				}

			} );

			this.updateScene();

		},
		activeTextureTheme: function ( theme ) {

			const scope = this;

			this.scene.traverse( c => {

				if ( c.supportsMaterials ) {

					c.setTextureTheme( theme, scope.textureManager );

				}

			} );

			this.updateScene();

		},
		attributeColors: {
			handler: function () {

				this.scene.traverse( c => {

					if ( c.isCityObject ) {

						c.material.attributeColors = this.attributeColors;

					}

				} );

				this.updateScene();

			},
			deep: true
		}
	},
	beforeCreate() {

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.raycaster = null;
		this.mouse = null;
		this.spotLight = null;

	},
	mounted() {

		this.initScene();

		this.loadCitymodel( this.citymodel );

		this.updateScene();

		this.renderer.domElement.addEventListener( 'pointerdown', this.pointerDown, false );
		this.renderer.domElement.addEventListener( 'pointermove', this.pointerMove, false );
		this.renderer.domElement.addEventListener( 'pointerup', this.pointerUp, false );

	},
	methods: {
		loadCitymodel( citymodel ) {

			this.$emit( 'rendering', true );

			if ( Object.keys( citymodel ).length > 0 ) {

				this.parser = new CityJSONWorkerParser();
				this.parser.chunkSize = 2000;

				const scope = this;
				this.parser.onChunkLoad = () => {

					scope.lods = scope.parser.lods;

					this.$emit( 'objectColorsChanged', scope.parser.objectColors );
					this.$emit( 'surfaceColorsChanged', scope.parser.surfaceColors );

					scope.refreshColors();

					scope.updateScene();

					scope.$emit( 'chunkLoaded' );

				};

				this.parser.onComplete = () => {

					scope.$emit( 'rendering', false );
					scope.$emit( 'loadCompleted' );

				};

				const loader = new CityJSONLoader( this.parser );
				loader.load( citymodel );

				const bbox = loader.boundingBox.clone();
				bbox.applyMatrix4( loader.matrix );

				this.fitCameraToSelection( this.camera, this.controls, bbox );

				this.scene.add( loader.scene );

			}

		},
		fitCameraToSelection( camera, controls, box, fitOffset = 1.2 ) {

			// From https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24

			// const box.makeEmpty();
			// for ( const object of selection ) {

			//   box.expandByObject( object );

			// }
			const size = new THREE.Vector3();
			const center = new THREE.Vector3();

			box.getSize( size );
			box.getCenter( center );

			const maxSize = Math.max( size.x, size.y, size.z );
			const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
			const fitWidthDistance = fitHeightDistance / camera.aspect;
			const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );

			const direction = controls.target.clone()
				.sub( camera.position )
				.normalize()
				.multiplyScalar( distance );

			controls.maxDistance = distance * 10;
			controls.target.copy( center );

			camera.near = distance / 100;
			camera.far = distance * 100;
			camera.updateProjectionMatrix();

			camera.position.copy( controls.target ).sub( direction );

			controls.update();

		},
		updateScene() {

			if ( this.cameraSpotlight ) {

				this.spotLight.position.copy( this.camera.position );

			}

			const idx = Object.keys( this.citymodel.CityObjects ).indexOf( this.selectedObjid );

			this.scene.traverse( c => {

				if ( c.material ) {

					const mats = Array.isArray( c.material ) ? c.material : [ c.material ];

					for ( const mat of mats ) {

						if ( mat.isCityObjectsMaterial ) {

							mat.selectSurface = this.highlightSelectedSurface;

							mat.highlightedObject = {

								objectIndex: idx,
								geometryIndex: this.selectedGeomIdx,
								boundaryIndex: this.selectedBoundaryIdx

							};

						}

					}

				}

			} );

			this.renderer.render( this.scene, this.camera );

		},
		refreshColors() {

			const scope = this;

			this.scene.traverse( mesh => {

				if ( mesh.material && mesh.material.isCityObjectsMaterial ) {

					mesh.material.objectColors = this.objectColors;
					mesh.material.surfaceColors = this.surfaceColors;

					mesh.material.highlightColor = scope.selectionColor;

				}

			} );

		},
		updateConditionalInfo() {

			if ( this.conditionalAttribute ) {

				const evaluator = new AttributeEvaluator( this.citymodel, this.conditionalAttribute );
				const colors = evaluator.createColors();

				this.$emit( 'attributeColorsChanged', colors );

				this.scene.traverse( c => {

					if ( c.isCityObject ) {

						c.addAttributeByProperty( evaluator );
						c.material.attributeColors = colors;

					}

				} );

			}

		},
		pointerDown( e ) {

			this.previousPos.x = e.clientX;
			this.previousPos.y = e.clientY;

		},
		pointerUp( e ) {

			if ( this.previousPos.x == e.clientX && this.previousPos.y == e.clientY ) {

				this.handleClick( e );

			}

		},
		pointerMove( e ) {

			if ( e.ctrlKey ) {

				this.handleClick( e );

			}

		},
		getActiveIntersection( results ) {

			// Filters through the results to find the first one for the active LoD

			if ( this.activeLod > - 1 ) {

				for ( let i = 0; i < results.length; i ++ ) {

					const lodIdx = results[ i ].object.resolveIntersectionInfo( results[ i ], this.citymodel ).lodIndex;

					if ( lodIdx == this.activeLod ) {

						return results[ i ];

					}

				}

			}

			return results[ 0 ];

		},
		handleClick( e ) {

			var rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ( ( e.clientX - rect.left ) / this.renderer.domElement.clientWidth ) * 2 - 1;
			this.mouse.y = - ( ( e.clientY - rect.top ) / this.renderer.domElement.clientHeight ) * 2 + 1;

			//get cameraposition
			this.raycaster.setFromCamera( this.mouse, this.camera );

			//calculate intersects
			var intersects = this.raycaster.intersectObject( this.scene, true );

			//if clicked on nothing return
			if ( intersects.length == 0 ) {

				this.$emit( 'object_clicked', null );
				return;

			}

			const intersection = this.getActiveIntersection( intersects );

			if ( intersection.object.isCityObject ) {

				const info = intersection.object.resolveIntersectionInfo( intersection, this.citymodel );

				this.$emit( 'object_clicked', [ info.objectId, info.geometryIndex, info.boundaryIndex ] );

			}

		},
		initScene() {

			const viewer = document.getElementById( "viewer" );
			const ratio = viewer.clientWidth / viewer.clientHeight;

			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 60, ratio, 0.0001, 4000 );
			this.camera.position.set( 0, - 1, 1 );
			this.camera.up.set( 0, 0, 1 );

			this.renderer = new THREE.WebGLRenderer( {
				antialias: window.devicePixelRatio > 1 ? false : true,
				powerPreference: "high-performance"
			} );
			this.renderer.outputEncoding = SRGBColorSpace;
			viewer.appendChild( this.renderer.domElement );
			this.renderer.setSize( viewer.clientWidth, viewer.clientHeight );
			this.renderer.setClearColor( this.backgroundColor );
			// this.renderer.shadowMap.enabled = true;
			// this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			let self = this;

			// add raycaster and mouse (for clickable objects)
			this.raycaster = new THREE.Raycaster();
			this.mouse = new THREE.Vector2();

			//add AmbientLight (light that is only there that there's a minimum of light and you can see color)
			//kind of the natural daylight
			var am_light = new THREE.AmbientLight( 0x666666, 0.7 ); // soft white light
			this.scene.add( am_light );

			// Add directional light
			this.spotLight = new THREE.DirectionalLight( 0xDDDDDD );
			this.spotLight.position.set( 1, 2, 3 );
			this.spotLight.target = this.scene;
			// this.spotLight.castShadow = true;
			// spot_light.intensity = 0.4;
			// spot_light.position.normalize();
			this.scene.add( this.spotLight );

			//render & orbit controls
			this.controls = new OrbitControls( this.camera, this.renderer.domElement );
			this.controls.addEventListener( 'change', function () {

				self.updateScene();

			} );
			this.controls.target.set( 0, 0, 0 );

			const scope = this;
			window.addEventListener( 'resize', _ => {

				scope.camera.aspect = viewer.clientWidth / viewer.clientHeight;
				scope.camera.updateProjectionMatrix();

				scope.renderer.setSize( viewer.clientWidth, viewer.clientHeight );

				scope.updateScene();

			}, false );

		},
		clearScene() {

			while ( this.scene.children.length > 0 ) {

				this.scene.remove( this.scene.children[ 0 ] );

			}

			var am_light = new THREE.AmbientLight( 0xFFFFFF, 0.7 ); // soft white light
			this.scene.add( am_light );

			// Add directional light
			var spot_light = new THREE.SpotLight( 0xDDDDDD );
			spot_light.position.set( 84616, - 1, 447422 );
			spot_light.target = this.scene;
			spot_light.castShadow = true;
			spot_light.intensity = 0.4;
			spot_light.position.normalize();
			this.scene.add( spot_light );

		},
		getLods() {

			return this.lods;

		}
	}
};
</script>

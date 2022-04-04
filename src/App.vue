<template>
  <div class="h-100">
    <div
      id="helpModal"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      aria-labelledby="helpModelLabel"
      aria-hidden="true"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5
              id="helpModelLabel"
              class="modal-title"
            >
              <i class="far fa-question-circle mr-1"></i> Help
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>This is ninja, our viewer for CityJSON.</p>
            <p>The source code is available in <a href="https://github.com/cityjson/ninja">GitHub</a>. Have fun and, please, report any issues found <a href="https://github.com/cityjson/ninja/issues">here</a>.</p>
            <p>Here is what you can do:</p>
            <ul>
              <li>Click on an object ID in the tree view on the left to select it.</li>
              <li>Click or tap on an object in the 3D view to select it.</li>
              <li>When an object is selected you see a card with it's information (oh, wow)! If you click on a surface with semantics, its information will also be accessible.</li>
              <li>Toggle between different LoDs by clicking on the corresponding buttons on the bottom left corner of the viewer.</li>
              <li>Toggle the editing mode with the <i class="fas fa-pen mx-1 text-muted"></i> icon to edit it. Then save the changes.</li>
              <li>Download the city model with your changes by clicking on <b>Download</b>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div
      id="configModal"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      aria-labelledby="helpModelLabel"
      aria-hidden="true"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header text-info">
            <h5
              id="helpModelLabel"
              class="modal-title"
            >
              <i class="fas fa-sliders-h mr-1"></i> Settings
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group row custom-control custom-switch ml-1">
              <input
                id="cameraLightSwitch"
                v-model="cameraLight"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label"
                for="cameraLightSwitch"
              >Camera light</label>
            </div>
            <ColorEditor
              v-model="background_color"
              name="Background"
            ></ColorEditor>
            <ColorEditor
              v-model="selectionColor"
              name="Selection"
            ></ColorEditor>
            <div
              id="accordionExample"
              class="accordion"
            >
              <div class="card">
                <div
                  id="headingOne"
                  class="card-header"
                >
                  <h2 class="mb-0">
                    <button
                      class="btn btn-link btn-block text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      Object Colours
                    </button>
                  </h2>
                </div>

                <div
                  id="collapseOne"
                  class="collapse"
                  aria-labelledby="headingOne"
                  data-parent="#accordionExample"
                >
                  <div class="card-body">
                    <ColorEditor
                      v-for="(color, type) in object_colors"
                      :key="type"
                      v-model="object_colors[type]"
                      :name="type"
                    ></ColorEditor>
                  </div>
                </div>
              </div>
              <div class="card">
                <div
                  id="headingTwo"
                  class="card-header"
                >
                  <h2 class="mb-0">
                    <button
                      class="btn btn-link btn-block text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseTwo"
                      aria-expanded="false"
                      aria-controls="collapseTwo"
                    >
                      Surface Colours
                    </button>
                  </h2>
                </div>
                <div
                  id="collapseTwo"
                  class="collapse"
                  aria-labelledby="headingTwo"
                  data-parent="#accordionExample"
                >
                  <div class="card-body">
                    <ColorEditor
                      v-for="(color, type) in surface_colors"
                      :key="type"
                      v-model="surface_colors[type]"
                      :name="type"
                    ></ColorEditor>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav
      class="navbar navbar-dark"
      :class="[ file_loaded ? 'bg-dark' : 'bg-white' ]"
    >
      <a
        class="navbar-brand"
        :class="[ file_loaded ? 'text-white' : 'text-dark' ]"
        href="#"
      ><img
        :src="logoUrl"
        :class="[ file_loaded ? 'logo-regular' : 'logo-big' ]"
      > <span :class="{ 'text-big' : !file_loaded }">ninja</span></a>
      <div class="d-flex justify-content-end align-items-center col-auto p-0">
        <div
          v-show="loading"
          class="spinner-border text-warning mr-2"
          role="status"
        >
          <span class="sr-only">Loading...</span>
        </div>
        <button
          type="button"
          class="btn btn-outline-info mr-1"
          data-toggle="modal"
          data-target="#configModal"
        >
          <i class="fas fa-sliders-h mr-1"></i> Settings
        </button>
        <button
          type="button"
          class="btn"
          :class="[ file_loaded ? 'btn-outline-light' : 'btn-outline-dark' ]"
          data-toggle="modal"
          data-target="#helpModal"
        >
          <i class="far fa-question-circle mr-1"></i> Help
        </button>
      </div>
    </nav>
    <div
      v-if="file_loaded"
      id="main_content"
    >
      <div class="container-fluid h-100">
        <div class="row h-100">
          <div class="d-sm-none d-lg-block col-lg-1 bg-dark p-0">
            <ninja-sidebar
              v-model="active_sidebar"
              :with_versions="has_versions"
            ></ninja-sidebar>
          </div>
          <div class="col-4 p-0 h-100">
            <div
              v-show="active_sidebar == 'objects'"
              class="h-100"
            >
              <div class="h-100 d-flex flex-column">
                <div class="p-3 shadow-sm">
                  <h5>
                    City Objects
                    <span
                      v-if="active_version != null"
                      class="badge badge-primary mr-1"
                    >
                      Version: {{ active_version | truncate(7) }}
                    </span>
                    <span class="badge badge-secondary">
                      {{ Object.keys(activeCityModel.CityObjects).length }} total
                    </span>
                  </h5>
                  <input
                    v-model="search_term"
                    type="search"
                    class="form-control col mb-2 shadow-sm"
                    placeholder="Search for IDs, object type or attributes..."
                  >
                  <div
                    v-show="file_loaded"
                    class="d-flex justify-content-end col-auto p-0"
                  >
                    <button
                      class="btn btn-primary col-auto"
                      @click="downloadModel()"
                    >
                      <i class="fas fa-download mr-1"></i> Download
                    </button>
                    <button
                      class="btn btn-danger col-auto ml-2"
                      @click="reset()"
                    >
                      <i class="fas fa-times mr-1"></i> Close
                    </button>
                  </div>
                </div>
                <CityObjectsTree
                  :citymodel="activeCityModel"
                  :cityobjects="firstLevelObjects"
                  :selected_objid="selected_objid"
                  :matches="matches"
                  @object_clicked="move_to_object( [ $event, - 1, - 1 ] )"
                ></CityObjectsTree>
              </div>
            </div>
            <div
              v-if="has_versions"
              v-show="active_sidebar == 'versions'"
              class="p-3"
            >
              <branch-selector
                v-model="active_branch"
                :versioning="citymodel.versioning"
              ></branch-selector>
              <version-list
                :versioning="citymodel.versioning"
                :active_branch="active_branch"
                :active_version.sync="active_version"
              ></version-list>
            </div>
          </div>
          <div class="col-7 p-0 h-100">
            <div
              class="col-auto m-2"
              style="position: absolute; z-index: 1"
            >
              <CityObjectCard
                v-if="existsSelected"
                :citymodel="activeCityModel"
                :cityobject="activeCityModel.CityObjects[selected_objid]"
                :cityobject_id="selected_objid"
                :geometry-id="selectedGeometryId"
                :boundary-id="selectedBoundaryId"
                :expanded="0"
                :editable="true"
                @input="activeCityModel.CityObjects[selected_objid] = $event"
                @close="selected_objid = null"
              ></CityObjectCard>
            </div>
            <ThreeJsViewer
              ref="viewer"
              :citymodel="activeCityModel"
              :selected-objid="selected_objid"
              :selected-geom-idx="selectedGeometryId"
              :selected-boundary-idx="selectedBoundaryId"
              :object-colors="object_colors"
              :surface-colors="surface_colors"
              :background-color="background_color"
              :selection-color="selectionColor"
              :show-semantics="showSemantics"
              :active-lod="activeLoD"
              :camera-spotlight="cameraLight"
              :highlight-selected-surface="highlightSurface"
              @object_clicked="move_to_object($event)"
              @rendering="loading = $event"
              @chunkLoaded="availableLoDs = $refs.viewer.getLods()"
            ></ThreeJsViewer>
            <div
              style="position: absolute; z-index: 1; bottom: 0px; left: 0px"
            >
              <div class="custom-control custom-switch ml-1">
                <input
                  id="surfaceSwitch"
                  v-model="highlightSurface"
                  type="checkbox"
                  class="custom-control-input"
                >
                <label
                  class="custom-control-label"
                  for="surfaceSwitch"
                >Select surface</label>
              </div>
              <div class="custom-control custom-switch ml-1">
                <input
                  id="semanticsSwitch"
                  v-model="showSemantics"
                  type="checkbox"
                  class="custom-control-input"
                >
                <label
                  class="custom-control-label"
                  for="semanticsSwitch"
                >Semantics</label>
              </div>
              <div
                class="btn-group ml-1 mb-1 bg-white"
                role="group"
                aria-label="Basic example"
              >
                <button
                  type="button"
                  :class="['btn', activeLoD == - 1 ? 'btn-primary' : 'btn-outline-primary']"
                  @click="activeLoD = - 1"
                >
                  All
                </button>
                <button
                  v-for="( lod, idx ) in availableLoDs"
                  :key="lod"
                  type="button"
                  :class="['btn', activeLoD == idx ? 'btn-primary' : 'btn-outline-primary']"
                  @click="activeLoD = idx"
                >
                  LoD{{ lod }}
                </button>
              </div>
            </div>
            <div
              class="card"
              style="position: absolute; z-index: 1; bottom: 0px; right: 0px"
            >
              <div class="m-1 px-2">
                <a
                  href="https://cityjson.org"
                  target="_blank"
                ><img
                  src="https://www.cityjson.org/assets/images/cityjson_logo.svg"
                  alt=""
                ></a>
              </div>
              <div class="m-1 px-2">
                <a
                  class="card-link"
                  href="https://github.com/cityjson/ninja"
                  target="_blank"
                ><i class="fab fa-github"></i> ninja v0.6.1</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div
        class="container"
        style="width:75%; max-width: 680px"
      >
        <div class="row">
          <main class="col-12 py-md-3 pl-md-5">
            <h2>File upload</h2>
            <p>Upload a CityJSON file to have fun!</p>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text"><i class="fas fa-upload mr-1"></i> Upload</span>
              </div>
              <div class="custom-file">
                <input
                  id="inputGroupFile01"
                  ref="cityJSONFile"
                  type="file"
                  class="custom-file-input"
                  @change="selectedFile"
                >
                <label
                  class="custom-file-label"
                  for="inputGroupFile01"
                >Choose file or drop it here...</label>
              </div>
            </div>
            <div
              v-show="error_message"
              class="alert alert-danger"
              role="alert"
            >
              {{ error_message }}
              <button
                type="button"
                class="close"
                data-dismiss="alert"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ColorEditor from './components/ColorEditor.vue';
import NinjaSidebar from './components/NinjaSidebar.vue';
import BranchSelector from './components/Versioning/BranchSelector.vue';
import VersionList from './components/Versioning/VersionList.vue';
import $ from 'jquery';
import _ from 'lodash';

export default {
	name: 'App',
	components: {
		ColorEditor,
		NinjaSidebar,
		BranchSelector,
		VersionList
	},
	data: function () {

		return {
			file_loaded: false,
			search_term: "",
			citymodel: {},
			selected_objid: null,
			selectedGeometryId: - 1,
			selectedBoundaryId: - 1,
			loading: false,
			error_message: null,
			active_sidebar: 'objects', // objects/versions
			has_versions: false,
			active_branch: 'master',
			active_version: null,
			object_colors: {
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
			},
			surface_colors: {
				"GroundSurface": 0x999999,
				"WallSurface": 0xffffff,
				"RoofSurface": 0xff0000,
				"TrafficArea": 0x6e6e6e,
				"AuxiliaryTrafficArea": 0x2c8200,
				"Window": 0x0059ff,
				"Door": 0x640000
			},
			background_color: 0xd9eefc,
			selectionColor: 0xffc107,
			showSemantics: true,
			highlightSurface: false,
			availableLoDs: [],
			activeLoD: - 1,
			cameraLight: false
		};

	},
	computed: {
		activeCityModel: function () {

			if ( this.active_version != null ) {

				return this.extract_citymodel( this.active_version );

			} else {

				return this.citymodel;

			}

		},
		logoUrl: function () {

			if ( this.file_loaded ) {

				return "logoWhite.svg";

			}

			return "logoBlack.svg";

		},
		firstLevelObjects: function () {

			return _.pickBy( this.activeCityModel.CityObjects, function ( cityobject ) {

				return ! ( cityobject.parents && cityobject.parents.length > 0 );

			} );

		},
		filteredCityObjects: function () {

			var result = _.pickBy( this.activeCityModel.CityObjects, function ( value, key ) {

				var regex = RegExp( this.search_term, "i" );
				var obj_json = JSON.stringify( value );
				return regex.test( key ) | regex.test( obj_json );

			} );

			return result;

		},
		existsSelected: function () {

			return this.selected_objid != null;

		}
	},
	watch: {
		selected_objid: function () {

			if ( this.selected_objid != null ) {

				var card_id = $.escapeSelector( this.selected_objid );
				$( `#${card_id}` )[ 0 ].scrollIntoViewIfNeeded();

			}

		}
	},
	methods: {
		extract_citymodel( vid ) {

			var object_dict = this.citymodel.versioning.versions[ vid ].objects;
			var original_objects = this.citymodel.CityObjects;

			var result = $.extend( {}, this.citymodel );

			result[ "CityObjects" ] = {};

			delete result[ "versioning" ];

			Object.keys( object_dict ).forEach( ( key ) => {

				result[ "CityObjects" ][ key ] = $.extend( {}, original_objects[ object_dict[ key ] ] );

			} );

			return result;

		},
		move_to_object( ids ) {

			if ( ids ) {

				// `ids` is in the form of [ objectId, geometryId, boudnaryId ]
				this.selected_objid = ids[ 0 ];
				this.selectedGeometryId = ids[ 1 ];
				this.selectedBoundaryId = ids[ 2 ];

			} else {

				this.selected_objid = null;
				this.selectedGeometryId = - 1;
				this.selectedBoundaryId = - 1;

			}

		},
		reset() {

			this.citymodel = {};
			this.search_term = "";
			this.file_loaded = false;

		},
		matches( coid, cityobject ) {

			var regex = RegExp( this.search_term, "i" );
			var obj_json = JSON.stringify( cityobject );
			if ( cityobject.children && cityobject.children.length > 0 ) {

				return regex.test( coid ) || regex.test( obj_json ) || cityobject.children.some( obj_id => {

					return this.matches( obj_id, this.citymodel.CityObjects[ obj_id ] );

				} );

			} else {

				return regex.test( coid ) || regex.test( obj_json );

			}

		},
		validateCityJSON( cm ) {

			if ( cm.type != "CityJSON" ) {

				this.error_message = "This is not a CityJSON file!";

				return false;

			}

			return true;

		},
		selectedFile() {

			this.loading = true;

			let file = this.$refs.cityJSONFile.files[ 0 ];
			if ( ! file || file.type != "application/json" ) {

				this.error_message = "This is not a JSON file!";
				this.loading = false;
				return;

			}

			let reader = new FileReader();
			reader.readAsText( file, "UTF-8" );
			reader.onload = evt => {

				var cm = JSON.parse( evt.target.result );

				if ( this.validateCityJSON( cm ) == false ) {

					this.loading = false;
					return;

				}

				this.citymodel = cm;

				this.has_versions = "versioning" in cm;

				this.file_loaded = true;

				this.loading = false;

			};

		},
		download( filename, text ) {

			var element = document.createElement( 'a' );
			element.setAttribute( 'href', 'data:application/json;charset=utf-8,' + encodeURIComponent( text ) );
			element.setAttribute( 'download', filename );

			element.style.display = 'none';
			document.body.appendChild( element );

			element.click();

			document.body.removeChild( element );

		},
		downloadModel() {

			var text = JSON.stringify( this.citymodel );

			this.download( "citymodel.json", text );

		}
	}
};
</script>

<style scoped>
.logo-big {
  position: absolute;
  height: 120px;
}

.logo-regular {
  height: 24px;
}

.text-big {
  padding-left: 140px;
}
</style>

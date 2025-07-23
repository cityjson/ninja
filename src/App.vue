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
            <div class="form-group row custom-control custom-switch ml-1">
              <input
                id="doubleSideSwitch"
                v-model="doubleSide"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label"
                for="doubleSideSwitch"
              >Double side</label>
            </div>
            <div class="form-group row custom-control custom-switch ml-1">
              <input
                id="performanceModeSwitch"
                v-model="performanceMode"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label"
                for="performanceModeSwitch"
              >Performance mode</label>
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
                  <h4 class="mb-0">
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
                  </h4>
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
                  <h4 class="mb-0">
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
                  </h4>
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
              <div class="card">
                <div
                  id="headingThree"
                  class="card-header"
                >
                  <h5 class="mb-0">
                    <button
                      class="btn btn-link btn-block text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseThree"
                      aria-expanded="false"
                      aria-controls="collapseThree"
                    >
                      Conditional formatting
                    </button>
                  </h5>
                </div>
                <div
                  id="collapseThree"
                  class="collapse"
                  aria-labelledby="headingThree"
                  data-parent="#accordionExample"
                >
                  <div class="card-body">
                    <div class="form-group row custom-control custom-switch ml-1">
                      <input
                        id="conditionalFormattingSwitch"
                        v-model="conditionalFormatting"
                        type="checkbox"
                        class="custom-control-input"
                      >
                      <label
                        class="custom-control-label"
                        for="conditionalFormattingSwitch"
                      >Show</label>
                    </div>
                    <div class="form-group">
                      <label for="conditionalAttributeSelect">Attribute</label>
                      <select
                        id="conditionalAttributeSelect"
                        class="form-control"
                        @change="conditionalAttribute = $event.target.value"
                      >
                        <option value=""></option>
                        <option
                          v-for="attribute in conditionalAttributes"
                          :key="attribute"
                        >
                          {{ attribute }}
                        </option>
                      </select>
                    </div>
                    <ColorEditor
                      v-for="(color, type) in attributeColors"
                      :key="type"
                      v-model="attributeColors[type]"
                      :name="type"
                    ></ColorEditor>
                  </div>
                </div>
              </div>
              <div class="card">
                <div
                  id="headingAppearance"
                  class="card-header"
                >
                  <h5 class="mb-0">
                    <button
                      class="btn btn-link btn-block text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseAppearance"
                      aria-expanded="false"
                      aria-controls="collapseAppearance"
                    >
                      Appearance
                    </button>
                  </h5>
                </div>
                <div
                  id="collapseAppearance"
                  class="collapse"
                  aria-labelledby="headingAppearance"
                  data-parent="#accordionExample"
                >
                  <div class="card-body">
                    <div class="form-group">
                      <label for="materialThemeSelect">Material theme</label>
                      <select
                        id="materialThemeSelect"
                        class="form-control"
                        @change="activeMaterialTheme = $event.target.value"
                      >
                        <option value="undefined"></option>
                        <option
                          v-for="theme of materialThemes"
                          :key="theme"
                        >
                          {{ theme }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="textureThemeSelect">Texture theme</label>
                      <select
                        id="textureThemeSelect"
                        class="form-control"
                        @change="activeTextureTheme = $event.target.value"
                      >
                        <option value="undefined"></option>
                        <option
                          v-for="theme of textureThemes"
                          :key="theme"
                        >
                          {{ theme }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="textureThemeSelect">Textures ({{ resolvedTextures }} / {{ totalTextures }})</label>
                      <div class="input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text"><i class="fas fa-image mr-1"></i> Textures</span>
                        </div>
                        <div class="custom-file">
                          <input
                            id="inputGroupFile01"
                            ref="textureFile"
                            type="file"
                            class="custom-file-input"
                            multiple="multiple"
                            @change="uploadTexture"
                          >
                          <label
                            class="custom-file-label"
                            for="inputGroupFile01"
                          >Choose file or drop it here...</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="performanceModal"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      aria-labelledby="performanceModalLabel"
      aria-hidden="true"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header bg-warning text-white">
            <h5
              id="performanceModalLabel"
              class="modal-title"
            >
              <i class="fas fa-exclamation-triangle mr-1"></i> Performance mode
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
          <div class="modal-header">
            <h5 class="modal-title"></h5>
          </div>
          <div class="modal-body">
            You are about to disable performance mode. This might temporarily
            make your browser unresponsive while the object list is populated.
            Depending on your model's size, this might take a few seconds.

            Are you sure you want to disable performance mode?
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-danger"
              data-dismiss="modal"
              @click="performanceMode = false"
            >
              Go ahead, I am prepared!
            </button>
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
         v-if=" !file_loaded "
         :src="require('url:../public/logoBlack.svg')"
         class="logo-big"
       >
        <img
          v-else
          :src="require('url:../public/logoWhite.svg')"
          class="logo-regular"
        >
        <span :class="{ 'text-big' : !file_loaded }">ninja</span></a>
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
                      {{ (activeCityModel && activeCityModel.CityObjects) ? Object.keys(activeCityModel.CityObjects).length : 0 }} total
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
                  v-if="! performanceMode"
                  :citymodel="activeCityModel"
                  :cityobjects="firstLevelObjects"
                  :selected_objid="selected_objid"
                  :matches="matches"
                  @object_clicked="move_to_object( [ $event, - 1, - 1 ] )"
                ></CityObjectsTree>
                <div
                  v-else
                  class="p-2"
                >
                  <div
                    class="alert alert-warning"
                    role="alert"
                  >
                    <h4 class="alert-heading">
                      Performance mode!
                    </h4>

                    ninja detected that you have a large number of objects,
                    therefore you are currently in performance mode. In this
                    mode, the object list is disabled and certain features may
                    not work properly. You can still use the 3D view and select
                    objects.
                    <hr>
                    You can choose to disable performance mode at your own risk by
                    clicking on the button below!
                  </div>
                  <button
                    type="button"
                    class="btn btn-warning"
                    data-toggle="modal"
                    data-target="#performanceModal"
                  >
                    Disable performance mode
                  </button>
                </div>
              </div>
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
              :conditional-formatting="conditionalFormatting"
              :conditional-attribute="conditionalAttribute"
              :attribute-colors="attributeColors"
              :active-material-theme="activeMaterialTheme"
              :texture-manager="textureManager"
              :active-texture-theme="activeTextureTheme"
              :double-side="doubleSide"
              :ambient-occlusion="ambientOcclusion"
              :file-type="file_type"
              :fcb-loader="fcbLoader"
              :is-flat-city-buf="isFlatCityBuf"
              @object_clicked="move_to_object($event)"
              @rendering="loading = $event"
              @loadCompleted="onLoadComplete()"
              @chunkLoaded="availableLoDs = $refs.viewer.getLods()"
              @objectColorsChanged="object_colors = $event"
              @surfaceColorsChanged="surface_colors = $event"
              @attributeColorsChanged="attributeColors = $event"
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
              <div class="custom-control custom-switch ml-1">
                <input
                  id="ambientOcclussionSwitch"
                  v-model="ambientOcclusion"
                  type="checkbox"
                  class="custom-control-input"
                >
                <label
                  class="custom-control-label"
                  for="ambientOcclussionSwitch"
                >Ambient Occlusion</label>
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
                ><i class="fab fa-github"></i> ninja v0.8.2</a>
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
            <p>Upload a CityJSON (.json) or CityJSONSeq (.jsonl) file to have fun!</p>
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
                  accept=".json,.jsonl"
                  @change="selectedFile"
                >
                <label
                  class="custom-file-label"
                  for="inputGroupFile01"
                >Choose file or drop it here...</label>
              </div>
            </div>
            <hr class="my-4">
            <h2>FlatCityBuf URL</h2>
            <p>Or enter a FlatCityBuf URL to stream 3D city data!</p>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text"><i class="fas fa-link mr-1"></i> URL</span>
              </div>
              <input
                v-model="fcbUrl"
                type="url"
                class="form-control"
                placeholder="https://example.com/data.fcb"
                @keyup.enter="loadFlatCityBuf"
              >
              <div class="input-group-append">
                <button
                  class="btn btn-primary"
                  type="button"
                  :disabled="!fcbUrl || loading"
                  @click="loadFlatCityBuf"
                >
                  Load
                </button>
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
import { AttributeEvaluator, TextureManager, FlatCityBufLoader, CityJSONWorkerParser } from 'cityjson-threejs-loader';
import CityObjectCard from './lib-components/CityObjectCard.vue';
import CityObjectsTree from './lib-components/CityObjectsTree.vue';
import ThreeJsViewer from './lib-components/ThreeJsViewer.vue';
import { CityJSONSeqUtils } from './helpers/cjseq';
import $ from 'jquery';
import _ from 'lodash';

export default {
	name: 'App',
	components: {
		ColorEditor,
		NinjaSidebar,
		ThreeJsViewer,
		CityObjectsTree,
		CityObjectCard
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
			file_type: "json",
			fcbUrl: "",
			fcbLoader: null,
			isFlatCityBuf: false,
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
			cameraLight: false,
			doubleSide: true,
			ambientOcclusion: false,
			performanceMode: false,
			conditionalFormatting: false,
			conditionalAttribute: '',
			attributeColors: {},
			materialThemes: [],
			activeMaterialTheme: 'undefined',
			textureManager: null,
			textureThemes: [],
			activeTextureTheme: 'undefined'
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

		},
		conditionalAttributes: function () {

			if ( ! this.citymodel || ! this.citymodel.CityObjects ) {

				return [];

			}

			const attributes = new Set( Object.keys( this.citymodel.CityObjects ).map( objId => {

				const cityobject = this.citymodel.CityObjects[ objId ];

				if ( cityobject && cityobject.attributes && typeof cityobject.attributes === 'object' && cityobject.attributes !== null ) {

					return Object.keys( cityobject.attributes );

				}

				return [];

			} ).flat() );

			const atts = [ ...attributes ].filter( a => {

				const evaluator = new AttributeEvaluator( this.citymodel, a, false );

				return evaluator.getUniqueValues().length > 1 && evaluator.getUniqueValues().length < 20;

			} );

			return atts;

		},
		totalTextures: function () {

			if ( this.textureManager ) {

				return this.textureManager.totalTextures;

			}

			return 0;

		},
		resolvedTextures: function () {

			if ( this.textureManager ) {

				return this.textureManager.resolvedTextures;

			}

			return 0;

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
			this.file_type = "json";
			this.fcbUrl = "";
			this.isFlatCityBuf = false;

			if ( this.fcbLoader ) {

				this.fcbLoader.clear();
				this.fcbLoader = null;

			}

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

			if ( cm.type !== "CityJSON" ) {

				this.error_message = "This is not a CityJSON file!";

				return false;

			}

			return true;

		},
		uploadTexture() {

			const files = this.$refs.textureFile.files;

			for ( const file in files ) {

				this.textureManager.setTextureFromFile( files[ file ] );

			}

		},
		 selectedFile() {

			this.loading = true;
			let cm;

			let file = this.$refs.cityJSONFile.files[ 0 ];
			if ( ! file ) {

				this.error_message = "No file selected!";
				this.loading = false;
				return;

			}

			// Determine file type based on extension
			const fileName = file.name.toLowerCase();
			if ( fileName.endsWith( '.json' ) ) {

				this.file_type = "json";

			} else if ( fileName.endsWith( '.jsonl' ) ) {

				this.file_type = "jsonl";

			} else {

				this.error_message = "Please select a .json or .jsonl file!";
				this.loading = false;
				return;

			}

			let reader = new FileReader();
			reader.readAsText( file, "UTF-8" );
			reader.onload = async evt => {

				const fileContent = evt.target.result;

				if ( this.file_type === "jsonl" ) {

					// For CityJSONSeq files, validate the first line
					if ( CityJSONSeqUtils.validateCityJSONSeq( fileContent ) === false ) {

						this.error_message = 'Invalid CityJSONSeq file';
						this.loading = false;
						return;

					}

					const util = new CityJSONSeqUtils();
					cm = await util.toCityJSON( fileContent );

				} else {

					// For regular CityJSON files, parse and validate
					cm = JSON.parse( fileContent );

					if ( this.validateCityJSON( cm ) === false ) {

						this.loading = false;
						return;

					}

				}


				this.performanceMode = Object.keys( cm.CityObjects ).length > 10000;
				this.citymodel = this.performanceMode ? Object.freeze( cm ) : cm;
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

		},
		getMaterialThemes( citymodel ) {

			if ( ! citymodel || ! citymodel.CityObjects ) {

				return [];

			}

			const themes = Object.entries( citymodel.CityObjects ).map( cityobject => {

				const [ , obj ] = cityobject;

				if ( obj && obj.geometry && Array.isArray( obj.geometry ) ) {

					return obj.geometry.map( geom => {

						if ( geom && geom.material ) {

							return Object.keys( geom.material );

						} else {

							return [];

						}

					} );

				} else {

					return [];

				}


			} ).flat( 2 );

			return [ ... new Set( themes ) ];

		},
		getTextureThemes( citymodel ) {

			if ( ! citymodel || ! citymodel.CityObjects ) {

				return [];

			}

			const themes = Object.entries( citymodel.CityObjects ).map( cityobject => {

				const [ , obj ] = cityobject;

				if ( obj && obj.geometry && Array.isArray( obj.geometry ) ) {

					return obj.geometry.map( geom => {

						if ( geom && geom.texture ) {

							return Object.keys( geom.texture );

						} else {

							return [];

						}

					} );

				} else {

					return [];

				}


			} ).flat( 2 );

			return [ ... new Set( themes ) ];

		},
		onLoadComplete() {

			this.materialThemes = this.getMaterialThemes( this.citymodel );
			this.textureThemes = this.getTextureThemes( this.citymodel );
			this.textureManager = new TextureManager( this.citymodel );

		},
		async loadFlatCityBuf() {

			if ( ! this.fcbUrl ) {

				this.error_message = "Please enter a FlatCityBuf URL";
				return;

			}

			this.loading = true;
			this.error_message = null;

			try {

				// Initialize FlatCityBuf loader
				const parser = new CityJSONWorkerParser();
				this.fcbLoader = new FlatCityBufLoader( parser );
				await this.fcbLoader.setUrl( this.fcbUrl );

				// Set up initial empty citymodel
				this.citymodel = {
					type: "CityJSON",
					version: "2.0",
					CityObjects: {},
					vertices: []
				};

				this.file_type = "fcb";
				this.isFlatCityBuf = true;
				this.file_loaded = true;
				this.loading = false;

			} catch ( error ) {

				console.error( 'Error loading FlatCityBuf:', error );
				this.error_message = `Failed to load FlatCityBuf: ${error.message}`;
				this.loading = false;

			}

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

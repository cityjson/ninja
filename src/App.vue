<template>
  <div class="h-100">
    <div class="modal fade" id="helpModal" tabindex="-1" role="dialog" aria-labelledby="helpModelLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title" id="helpModelLabel"><i class="far fa-question-circle mr-1"></i> Help</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>What a wonderful viewer!</p>
            <p>Here is what you can do:</p>
            <ul>
              <li>Click on an object ID in the tree view on the left to select it.</li>
              <li>Double-click on an object in the 3D view to select it.</li>
              <li>When an object is selected you see a card with it's information (oh, wow)!</li>
              <li>Toggle the editing mode with the <i class="fas fa-pen mx-1 text-muted"></i> icon to edit it. Then save the changes</li>
              <li>Download the city model with your changes by clicking on <b>Download</b>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="configModal" tabindex="-1" role="dialog" aria-labelledby="helpModelLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header text-info">
            <h5 class="modal-title" id="helpModelLabel"><i class="fas fa-sliders-h mr-1"></i> Settings</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <ColorEditor
              v-model="background_color"
              name="Background"
            ></ColorEditor>
            <color-editor
              v-for="(color, type) in object_colors"
              :key="type"
              v-model="object_colors[type]"
              :name="type"
            ></color-editor>
          </div>
        </div>
      </div>
    </div>
    <nav class="navbar navbar-dark" :class="[ file_loaded ? 'bg-dark' : 'bg-white' ]">
      <a class="navbar-brand" :class="[ file_loaded ? 'text-white' : 'text-dark' ]" href="#"><img :src="logoUrl" :class="[ file_loaded ? 'logo-regular' : 'logo-big' ]"> <span :class="{ 'text-big' : !file_loaded }">NINJa</span></a>
      <div class="d-flex justify-content-end align-items-center col-auto p-0">
        <div class="spinner-border text-warning mr-2" role="status" v-show="loading">
          <span class="sr-only">Loading...</span>
        </div>
        <button type="button" class="btn btn-outline-info mr-1" data-toggle="modal" data-target="#configModal">
          <i class="fas fa-sliders-h mr-1"></i> Settings
        </button>
        <button type="button" class="btn" :class="[ file_loaded ? 'btn-outline-light' : 'btn-outline-dark' ]" data-toggle="modal" data-target="#helpModal">
          <i class="far fa-question-circle mr-1"></i> Help
        </button>
      </div>
    </nav>
    <div id="main_content" v-if="file_loaded">
      <div class="container-fluid h-100">
        <div class="row h-100">
          <main class="col-12 col-xl-4 p-0 h-100 d-flex flex-column">
            <div class="p-3 shadow-sm">
              <h5>City Objects <span class="badge badge-secondary">{{ Object.keys(citymodel.CityObjects).length }} total</span></h5>
              <input type="search" class="form-control col mb-2 shadow-sm" placeholder="Search for IDs, object type or attributes..." v-model="search_term">
              <div class="d-flex justify-content-end col-auto p-0" v-show="file_loaded">
                <button class="btn btn-primary col-auto" @click="downloadModel()"><i class="fas fa-download mr-1"></i> Download</button>
                <button class="btn btn-danger col-auto ml-2" @click="reset()"><i class="fas fa-times mr-1"></i> Close</button>
              </div>
            </div>
            <CityObjectsTree
              :cityobjects="firstLevelObjects"
              :selected_objid="selected_objid"
              :matches="matches"
            ></CityObjectsTree>
          </main>
          <div class="col-12 col-xl-8 p-0 h-100">
            <div class="col-auto m-2 =0" style="position: absolute; z-index: 1">
              <CityObjectCard
                :cityobject="citymodel.CityObjects[selected_objid]"
                @input="citymodel.CityObjects[selected_objid] = arguments[0]"
                :cityobject_id="selected_objid"
                :expanded=true
                v-if="existsSelected"
              ></CityObjectCard>
            </div>
            <ThreeJsViewer
              v-bind:citymodel="citymodel"
              :selected_objid="selected_objid"
              :object_colors="object_colors"
              :background_color="background_color"
            ></ThreeJsViewer>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="container">
        <div class="row">
          <main class="col-12 py-md-3 pl-md-5">
            <h2>File upload</h2>
            <p>Upload a CityJSON file to have fun!</p>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text"><i class="fas fa-upload mr-1"></i> Upload</span>
              </div>
              <div class="custom-file">
                <input type="file" class="custom-file-input" id="inputGroupFile01" ref="cityJSONFile" @change="selectedFile">
                <label class="custom-file-label" for="inputGroupFile01">Choose file or drop it here...</label>
              </div>
            </div>
            <div class="alert alert-danger" role="alert" v-show="error_message">
              {{ error_message }}
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ColorEditor from './components/ColorEditor.vue'
import $ from 'jquery'
import _ from 'lodash'

export default {
  name: 'app',
  components: {
    ColorEditor
  },
  data: function() {
    return {
      file_loaded: false,
      search_term: "",
      citymodel: {},
      selected_objid: null,
      loading: false,
      error_message: null,
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
      background_color: 0xd9eefc
    }
  },
  created() {
    let self = this;

    this.$on('object_clicked', (objid) => {
      self.move_to_object(objid);
    });

    this.$on('rendering', (status) => {
      self.loading = status;
    });
  },
  watch: {
    selected_objid: function() {
      if (this.selected_objid != null)
      {
        var card_id = $.escapeSelector(this.selected_objid);
        $(`#${card_id}`)[0].scrollIntoViewIfNeeded();
      }
    }
  },
  computed: {
    logoUrl: function() {
      if (this.file_loaded)
      {
        return "logoWhite.svg";
      }

      return "logoBlack.svg";
    },
    firstLevelObjects: function() {
      return _.pickBy(this.citymodel.CityObjects, function(cityobject) {
        return !(cityobject.parents && cityobject.parents.length > 0);
      });
    },
    filteredCityObjects: function() {
      var result = _.pickBy(this.citymodel.CityObjects, function(value, key) {
        var regex = RegExp(this.search_term, "i");
        var obj_json = JSON.stringify(value);
        return regex.test(key) | regex.test(obj_json);
      });

      return result;
    },
    existsSelected: function() {
      return this.selected_objid != null;
    }
  },
  methods: {
    move_to_object(objid) {
      this.selected_objid = objid;
    },
    reset() {
      this.citymodel = {};
      this.search_term = "";
      this.file_loaded = false;
    },
    matches(coid, cityobject) {
      var regex = RegExp(this.search_term, "i");
      var obj_json = JSON.stringify(cityobject);
      if (cityobject.children && cityobject.children.length > 0)
      {
        return regex.test(coid) || regex.test(obj_json) || cityobject.children.some(obj_id => { return this.matches( obj_id, this.citymodel.CityObjects[obj_id] ) });
      }
      else
      {
        return regex.test(coid) || regex.test(obj_json);
      }
    },
    async selectedFile() {
      this.loading = true;

      let file = this.$refs.cityJSONFile.files[0];
      if (!file || file.type != "application/json")
      {
        this.error_message = "This is not a JSON file!";
        this.loading = false;
        return;
      }

      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = evt => {
        var cm = JSON.parse(evt.target.result);

        this.citymodel = cm;

        this.file_loaded = true;

        this.loading = false;
      }
    },
    download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    },
    downloadModel() {
      var text = JSON.stringify(this.citymodel);

      this.download("citymodel.json", text);
    }
  }
}
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
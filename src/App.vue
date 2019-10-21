<template>
  <div class="h-100">
    <nav class="navbar navbar-dark bg-dark">
      <a class="navbar-brand" href="#">CityJSON Viewer</a>
      <div class="d-flex justify-content-end align-items-center col-auto p-0">
        <div class="spinner-border text-warning mr-2" role="status" v-show="loading">
          <span class="sr-only">Loading...</span>
        </div>
        <button type="button" class="btn btn-outline-light" data-toggle="modal" data-target="#helpModal">
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
            <ul class="list-unstyled overflow-auto px-3">
              <CityObjectItem
                v-for="(cityobject, coid) in citymodel.CityObjects"
                :item="cityobject"
                :cityobject_id="coid"
                :key="coid"
                :selected="coid == selected_objid"
                v-show="matches(coid, cityobject)"
              ></CityObjectItem>  
            </ul>
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
import CityObjectCard from './components/CityObjectCard.vue'
import CityObjectItem from './components/CityObjectItem.vue'
import ThreeJsViewer from './components/ThreeJsViewer.vue'
import $ from 'jquery'
import _ from 'lodash'

export default {
  name: 'app',
  components: {
    CityObjectCard,
    CityObjectItem,
    ThreeJsViewer
  },
  data: function() {
    return {
      file_loaded: false,
      search_term: "",
      citymodel: {},
      selected_objid: null,
      loading: false,
      error_message: null
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
    firstLevelObjects: function() {
      return _.pickBy(this.citymodel.CityObjects, function(cityobject) {
        return !(cityobject.parents && cityobject.parents.length > 0);
      });
    },
    selected_objid: function() {
      if (this.selected_objid != null)
      {
        var card_id = $.escapeSelector(this.selected_objid);
        $(`#${card_id}`)[0].scrollIntoViewIfNeeded();
      }
    }
  },
  computed: {
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

<template>
  <li :id="cityobject_id">
    <div>
      <a href="#" @click="toggle" v-if="isFolder" class="mr-1">
        <i class="far text-dark text-decoration-none" v-bind:class="[ isOpen ? 'fa-minus-square' : 'fa-plus-square' ]"></i>
      </a>
      <span v-else class="mr-1">
        <i class="far fa-square text-secondary"></i>
      </span>
      <a href="#" id="objicon" :title="item.type"><i v-bind:class="iconType"></i></a>
      <a href="#" class="text-dark text-decoration-none" @click="select_this"><span :class="{ 'text-primary' : selected }">{{ cityobject_id }}</span></a>
      <a
        href="#"
        class="badge badge-primary mr-1"
        v-for="(geom, i) in singleGeometries"
        :key="i"
        :title="geom.type">
          <i :class="getGeometryIcon(geom.type)" class="mr-1"></i><small>{{ geom.lod }}</small>
      </a>
      <span
        class="badge badge-secondary mr-1"
        v-for="(geom, i) in geometryInstances"
        :key="i">
        <i class="fas fa-external-link-alt"></i>
      </span>
    </div>
    <ul class="list-unstyled ml-4 mb-0" v-show="isOpen" v-if="isFolder">
      <CityObjectsTreeItem
        class="item"
        v-for="child_id in item.children"
        :key="child_id"
        :item="getObject(child_id)"
        :cityobject_id="child_id"
        :selected_objid="selected_objid"
      ></CityObjectsTreeItem>
    </ul>
  </li>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'CityObjectsTreeItem',
  props: {
    item: Object,
    cityobject_id: String,
    selected_objid: String,
  },
  data: function () {
    return {
      isOpen: false
    }
  },
  created() {
    this.$on('object_clicked', (objid) => {
      this.$parent.$emit('object_clicked', objid);
    });
  },
  computed: {
    selected: function() {
      return this.cityobject_id == this.selected_objid;
    },
    singleGeometries: function() {
      return _.pickBy(this.item.geometry, function(geometry) {
        return geometry.lod;
      });
    },
    geometryInstances: function() {
      return _.pickBy(this.item.geometry, function(geom) {
        return geom.type == "GeometryInstance";
      });
    },
    isFolder: function () {
      return this.item.children &&
        this.item.children.length
    },
    iconType: function() {
      return this.getIconStyle(this.item);
    }
  },
  methods: {
    select_this() {
      this.$parent.$emit('object_clicked', this.cityobject_id);
    },
    toggle: function () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    },
    makeFolder: function () {
      if (!this.isFolder) {
        this.$emit('make-folder', this.item)
        this.isOpen = true
      }
    },
    getObject(objid) {
      return this.$parent.citymodel.CityObjects[objid];
    },
    getGeometryIcon(geom_type) {
      var geometry_icons = {
        "MultiSurface": ['fas', 'fa-map'],
        "Solid": ['fas', 'fa-cube'],
        "MultiSolid": ['fas', 'fa-cubes']
      }

      if (geom_type in geometry_icons)
      {
        return geometry_icons[geom_type];
      }
      else
      {
        return ['fas', 'fa-question'];
      }
    },
    getIconStyle(cityobj, with_colour=true) {
      var type_icons = {
        "Building": ['fas', 'fa-building', 'text-danger', 'mr-1'],
        "BuildingPart": ['far', 'fa-building', 'text-danger', 'mr-1'],
        "BuildingInstallation": ['fas', 'fa-city', 'text-danger', 'mr-1'],
        "Bridge": ['fas', 'fa-archway', 'text-dark', 'mr-1'],
        "BridgePart": ['fas', 'fa-archway', 'text-secondary', 'mr-1'],
        "BridgeInstallation": ['fas', 'fa-archway', 'text-primary', 'mr-1'],
        "BridgeConstructionElement": ['fas', 'fa-archway', 'text-warning', 'mr-1'],
        "CityObjectGroup": ['fas', 'fa-cubes', 'text-dark', 'mr-1'],
        "CityFurniture": ['fas', 'fa-store-alt', 'text-danger', 'mr-1'],
        "GenericCityObject": ['fas', 'fa-cube', 'text-danger', 'mr-1'],
        "LandUse": ['fas', 'fa-chart-area', 'text-success', 'mr-1'],
        "PlantCover": ['fas', 'fa-leaf', 'text-success', 'mr-1'],
        "Railway": ['fas', 'fa-train', 'text-primary', 'mr-1'],
        "Road": ['fas', 'fa-road', 'text-dark', 'mr-1'],
        "SolitaryVegetationObject": ['fas', 'fa-tree', 'text-success', 'mr-1'],
        "TINRelief": ['fas', 'fa-mountain', 'text-success', 'mr-1'],
        "TransportSquare": ['fas', 'fa-circle-notch', 'text-dark', 'mr-1'],
        "Tunnel": ['fas', 'fa-dot-circle', 'text-dark', 'mr-1'],
        "TunnelPart": ['fas', 'fa-dot-circle', 'text-dark', 'mr-1'],
        "TunnelInstallation": ['fas', 'fa-dot-circle', 'text-warning', 'mr-1'],
        "WaterBody": ['fas', 'fa-water', 'text-primary', 'mr-1']
      };

      if (cityobj.type in type_icons)
      {
        var icon_style = type_icons[cityobj.type];
        if (!with_colour)
        {
          icon_style.splice(2, 1);
        } 
        return icon_style;
      }
      else
      {
        return ['fas', 'fa-question', 'text-secondary', 'mr-1'];
      }
    },
  }
}
</script>
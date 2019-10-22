<template>
  <ul class="list-unstyled overflow-auto px-3">
    <CityObjectsTreeItem
      v-for="(cityobject, coid) in cityobjects"
      :item="cityobject"
      :cityobject_id="coid"
      :key="coid"
      :selected_objid="selected_objid"
      v-show="matches(coid, cityobject)"
    ></CityObjectsTreeItem>  
  </ul>
</template>

<script>
import CityObjectsTreeItem from './CityObjectsTreeItem.vue'

export default {
  name: 'CityObjectsTree',
  components: {
    CityObjectsTreeItem
  },
  props: ['cityobjects', 'selected_objid', 'matches'],
  computed: {
    citymodel: function() {
      return this.$parent.citymodel;
    }
  },
  created() {
    let self = this;

    this.$on('object_clicked', (objid) => {
      self.$parent.$emit('object_clicked', objid);
    });
  },
}
</script>
<template>
  <ul class="list-unstyled overflow-auto px-3">
    <CityObjectsTreeItem
      v-for="(cityobject, coid) in cityobjects"
      v-show="matches(coid, cityobject)"
      :key="coid"
      :citymodel="citymodel"
      :item="cityobject"
      :cityobject_id="coid"
      :selected_objid="selected_objid"
      @object_clicked="$emit('object_clicked', $event)"
    ></CityObjectsTreeItem>
  </ul>
</template>

<script>
import CityObjectsTreeItem from './CityObjectsTreeItem.vue';

export default {
	name: 'CityObjectsTree',
	components: {
		CityObjectsTreeItem
	},
	props: {
		cityobjects: Object,
		selected_objid: String,
		citymodel: Object,
		matches: {
			type: Function,
			default: function () {

				return true;

			}
		}
	},
	// computed: {
	//   citymodel: function() {
	//     return this.$parent.citymodel;
	//   }
	// }
};
</script>

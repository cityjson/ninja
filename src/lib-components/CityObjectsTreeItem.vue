<template>
  <li :id="cityobject_id">
    <div class="d-flex flex-inline align-items-center">
      <div
        class="d-flex justify-content-center"
        style="width: 20px"
      >
        <a
          v-if="isFolder"
          href="#"
          class="mr-1"
          @click="toggle"
        >
          <i
            class="fas text-dark text-decoration-none"
            :class="[ isOpen ? 'fa-chevron-down' : 'fa-chevron-right' ]"
          ></i>
        </a>
      </div>
      <div class="object-icon d-flex justify-content-center">
        <a
          id="objicon"
          href="#"
          :title="item.type"
        ><i :class="iconType"></i></a>
      </div>
      <a
        href="#"
        class="text-dark text-decoration-none mr-1"
        @click="select_this"
      ><span :class="{ 'text-primary' : selected }">{{ cityobject_id }}</span></a>
      <geometry-badge
        v-for="(geom, i) in item.geometry"
        :key="i"
        :geometry="geom"
      ></geometry-badge>
    </div>
    <ul
      v-show="isOpen"
      v-if="isFolder"
      class="list-unstyled ml-4 mb-0"
    >
      <CityObjectsTreeItem
        v-for="child_id in allChildren"
        :key="child_id"
        class="item"
        :citymodel="citymodel"
        :item="getObject(child_id)"
        :cityobject_id="child_id"
        :selected_objid="selected_objid"
        @object_clicked="$emit('object_clicked', $event)"
      ></CityObjectsTreeItem>
    </ul>
  </li>
</template>

<script>
import _ from 'lodash';
import { getIconStyle } from '../helpers/icons';

import GeometryBadge from './common/GeometryBadge.vue';

export default {
	name: 'CityObjectsTreeItem',
	components: {
		GeometryBadge
	},
	props: {
		item: Object,
		cityobject_id: String,
		selected_objid: String,
		citymodel: Object
	},
	data: function () {

		return {
			isOpen: false
		};

	},
	computed: {
		selected: function () {

			return this.cityobject_id == this.selected_objid;

		},
		singleGeometries: function () {

			return _.pickBy( this.item.geometry, function ( geometry ) {

				return geometry.lod;

			} );

		},
		geometryInstances: function () {

			return _.pickBy( this.item.geometry, function ( geom ) {

				return geom.type == "GeometryInstance";

			} );

		},
		isFolder: function () {

			return ( this.item.children && this.item.children.length )
				   || ( this.item.members && this.item.members.length );

		},
		allChildren: function () {

			if ( this.item.type == "CityObjectGroup" ) {

				return this.item.members;

			}

			return this.item.children;

		},
		iconType: function () {

			return getIconStyle( this.item );

		}
	},
	methods: {
		select_this() {

			this.$emit( 'object_clicked', this.cityobject_id );

		},
		toggle: function () {

			if ( this.isFolder ) {

				this.isOpen = ! this.isOpen;

			}

		},
		makeFolder: function () {

			if ( ! this.isFolder ) {

				this.$emit( 'make-folder', this.item );
				this.isOpen = true;

			}

		},
		getObject( objid ) {

			return this.citymodel.CityObjects[ objid ];

		},
		getGeometryIcon( geom_type ) {

			var geometry_icons = {
				"MultiSurface": [ 'fas', 'fa-map' ],
				"Solid": [ 'fas', 'fa-cube' ],
				"MultiSolid": [ 'fas', 'fa-cubes' ]
			};

			if ( geom_type in geometry_icons ) {

				return geometry_icons[ geom_type ];

			} else {

				return [ 'fas', 'fa-question' ];

			}

		}
	}
};
</script>

<style>
.object-icon {
  width: 24px;
}
</style>

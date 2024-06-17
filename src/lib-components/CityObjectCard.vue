<template>
  <div
    :id="cityobject_id"
    class="card mb-2"
    :class="{ 'border-primary' : selected }"
  >
    <div
      class="card-body"
      style="overflow: auto; max-height: 600px"
    >
      <CityObjectInfo
        :citymodel="citymodel"
        :cityobject="cityobject"
        :cityobject_id="cityobject_id"
        :geometry-id="geometryId"
        :boundary-id="boundaryId"
        :editable="editable"
        @input="saveChanges"
        @close="$emit('close')"
      ></CityObjectInfo>
    </div>
  </div>
</template>

<script>
import CityObjectInfo from './CityObjectInfo.vue';

export default {
	name: "CityObjectCard",
	components: {
		CityObjectInfo
	},
	props: {
		citymodel: Object,
		cityobject: Object,
		cityobject_id: String,
		geometryId: {
			type: Number,
			default: - 1
		},
		boundaryId: {
			type: Number,
			default: - 1
		},
		selected: {
			type: Boolean,
			default: false
		},
		expanded: {
			type: Number,
			default: 0
		},
		editable: {
			type: Boolean,
			default: true
		}
	},
	data() {

		return {
			edit_mode: false,
		};

	},
	computed: {
		attributesCount: function () {

			return Object.keys( this.cityobject.attributes ).length;

		},
		hasAttributes: function () {

			return "attributes" in this.cityobject && this.attributesCount > 0;

		},
		hasGeometries: function () {

			return this.cityobject.geometry;

		},
		iconType: function () {

			return this.getIconStyle( this.cityobject );

		},
		jsonString: {
			get: function () {

				return JSON.stringify( this.cityobject, undefined, 4 );

			}
		}
	},
	methods: {
		is_mode( mode ) {

			return this.expanded == mode;

		},
		select_this() {

			this.$emit( 'object_clicked', this.cityobject_id );

		},
		getObject( objid ) {

			if ( this.citymodel ) {

				return this.citymodel.CityObjects[ objid ];

			} else {

				return {};

			}

		},
		getIconStyle( cityobj, with_colour = true ) {

			var type_icons = {
				"Building": [ 'fas', 'fa-building', 'text-danger', 'mr-1' ],
				"BuildingPart": [ 'far', 'fa-building', 'text-danger', 'mr-1' ],
				"BuildingInstallation": [ 'fas', 'fa-city', 'text-danger', 'mr-1' ],
				"Bridge": [ 'fas', 'fa-archway', 'text-dark', 'mr-1' ],
				"BridgePart": [ 'fas', 'fa-archway', 'text-secondary', 'mr-1' ],
				"BridgeInstallation": [ 'fas', 'fa-archway', 'text-primary', 'mr-1' ],
				"BridgeConstructionElement": [ 'fas', 'fa-archway', 'text-warning', 'mr-1' ],
				"CityObjectGroup": [ 'fas', 'fa-cubes', 'text-dark', 'mr-1' ],
				"CityFurniture": [ 'fas', 'fa-store-alt', 'text-danger', 'mr-1' ],
				"GenericCityObject": [ 'fas', 'fa-cube', 'text-danger', 'mr-1' ],
				"LandUse": [ 'fas', 'fa-chart-area', 'text-success', 'mr-1' ],
				"PlantCover": [ 'fas', 'fa-leaf', 'text-success', 'mr-1' ],
				"Railway": [ 'fas', 'fa-train', 'text-primary', 'mr-1' ],
				"Road": [ 'fas', 'fa-road', 'text-dark', 'mr-1' ],
				"SolitaryVegetationObject": [ 'fas', 'fa-tree', 'text-success', 'mr-1' ],
				"TINRelief": [ 'fas', 'fa-mountain', 'text-success', 'mr-1' ],
				"TransportSquare": [ 'fas', 'fa-circle-notch', 'text-dark', 'mr-1' ],
				"Tunnel": [ 'fas', 'fa-dot-circle', 'text-dark', 'mr-1' ],
				"TunnelPart": [ 'fas', 'fa-dot-circle', 'text-dark', 'mr-1' ],
				"TunnelInstallation": [ 'fas', 'fa-dot-circle', 'text-warning', 'mr-1' ],
				"WaterBody": [ 'fas', 'fa-water', 'text-primary', 'mr-1' ]
			};

			if ( cityobj.type in type_icons ) {

				var icon_style = type_icons[ cityobj.type ];
				if ( ! with_colour ) {

					icon_style.splice( 2, 1 );

				}

				return icon_style;

			} else {

				return [ 'fas', 'fa-question', 'text-secondary', 'mr-1' ];

			}

		},
		saveChanges( newCityObject ) {

			console.log( newCityObject );

			this.$emit( 'input', newCityObject );

		}
	}
};
</script>

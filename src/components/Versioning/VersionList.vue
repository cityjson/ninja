<template>
  <div class="list-group py-md-2">
    <version-list-item
      v-for="(item, hash) in orderedVersions"
      :key="hash"
      :version="item"
      :vid="hash"
      :active="isActive(hash)"
      @select="$emit('update:active_version', hash)"
    ></version-list-item>
  </div>
</template>

<script>
import VersionListItem from './VersionListItem.vue';

export default {
	name: 'VersionList',
	components: {
		VersionListItem
	},
	props: {
		versioning: Object,
		active_version: String,
		active_branch: String
	},
	computed: {
		orderedVersions: function () {

			var result = {};

			var current_vid = this.versioning.branches[ this.active_branch ];
			result[ current_vid ] = this.versioning.versions[ current_vid ];

			var new_parents = [];

			if ( "parents" in result[ current_vid ] ) {

				new_parents = new_parents.concat( result[ current_vid ].parents );

			}

			while ( new_parents.length > 0 ) {

				current_vid = new_parents.pop();

				result[ current_vid ] = this.versioning.versions[ current_vid ];

				if ( "parents" in result[ current_vid ] ) {

					new_parents = result[ current_vid ].parents.concat( new_parents );

				}

			}

			return result;

		},
	},
	methods: {
		isActive( vid ) {

			return this.active_version == vid;

		},
	}
};
</script>

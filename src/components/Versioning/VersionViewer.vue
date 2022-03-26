<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h3>{{ version.message }}</h3>
      <a
        href="#"
        class="btn btn-sm btn-danger"
        @click="select(null)"
      ><i class="fas fa-times mr-1"></i> Close</a>
    </div>
    <hr class="my-2">
    <p class="text-muted">
      Version <a
        href="#"
        class="text-monospace"
        data-toggle="tooltip"
        data-placement="top"
      ><small>{{ vid | truncate(6) }}</small></a> authored {{ version.date | moment_from }} by <span class="font-weight-bold">{{ version.author }}</span>
    </p>
    <p
      v-show="'parents' in version && version.parents.length"
      class="my-2"
    >
      <small>Parents:
        <a
          v-for="parent in version.parents"
          :key="parent"
          href="#"
          class="card-link text-monospace"
          @click="select(parent)"
        >{{ parent | truncate(7) }}</a>
      </small>
    </p>
  </div>
</template>

<script>
import $ from 'jquery';
import moment from 'moment';

export default {
	name: 'VersionViewer',
	filters: {
		moment_from: function ( date ) {

			return moment( date ).fromNow();

		}
	},
	props: {
		version: Object,
		vid: String
	},
	beforeUpdate() {

		$( '[data-toggle="tooltip"]' ).tooltip( 'dispose' );
		$( '[data-toggle="tooltip"]' ).tooltip( { title: this.vid } );

	},
	methods: {
		select( vid ) {

			this.$root.$emit( 'select_version', vid );

		}
	}
};
</script>

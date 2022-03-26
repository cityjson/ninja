<template>
  <a
    class="list-group-item list-group-item-action flex-column align-items-start"
    :class="{ 'text-white' : active, active : active }"
    @click="$emit('select')"
  >
    <div class="d-flex justify-content-between">
      <div class="col-8 pl-0">
        <h6 class="mb-1">{{ version.message }} <span
          class="badge"
          :class="[ active ? 'badge-light' : 'badge-success' ]"
        >{{ Object.keys(version.objects).length }} objects</span></h6>
        <small :class="[ active ? 'text-white' : 'text-muted' ]"><b>{{ version.author }}</b> committed {{ version.date | moment_from }}.</small>
      </div>
      <div class="col-4 pr-0 align-self-center">
        <div class="input-group input-group-sm justify-content-end">
          <span
            id="basic-addon1"
            class="input-group-text text-monospace"
          ><small>{{ vid | truncate(7) }}</small></span>
          <div class="input-group-append">
            <button
              class="btn"
              :class="[ active ? 'btn-outline-light' : 'btn-outline-primary' ]"
              type="button"
              @click="$emit('download')"
            ><i class="fas fa-download"></i></button>
          </div>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
import moment from 'moment';

export default {
	name: 'VersionListItem',
	filters: {
		moment_from: function ( date ) {

			return moment( date ).fromNow();

		}
	},
	props: {
		version: Object,
		vid: String,
		active: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		download_this() {

			this.$emit( 'download' );

		},
		select_this() {

			this.$emit( 'select' );

		},
		moment: function () {

			return moment();

		}
	}
};
</script>

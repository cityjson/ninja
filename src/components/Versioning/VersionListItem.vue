<template>
  <a class="list-group-item list-group-item-action flex-column align-items-start" v-bind:class="{ 'text-white' : active, active : active }" v-on:click="select_this">
    <div class="d-flex justify-content-between">
      <div class="col-8 pl-0">
        <h6 class="mb-1">{{ version.message }} <span class="badge" v-bind:class="[ active ? 'badge-light' : 'badge-success' ]">{{ version.objects.length }} objects</span></h6>
        <small v-bind:class="[ active ? 'text-white' : 'text-muted' ]"><b>{{ version.author }}</b> committed {{ version.date | moment_from }}.</small>
      </div>
      <div class="col-4 pr-0 align-self-center">
        <div class="input-group input-group-sm justify-content-end">
          <span class="input-group-text text-monospace" id="basic-addon1"><small>{{ vid | truncate(7) }}</small></span>
          <div class="input-group-append">
            <button class="btn" v-bind:class="[ active ? 'btn-outline-light' : 'btn-outline-primary' ]" type="button" v-on:click="download_version(vid)"><i class="fas fa-download"></i></button>
          </div>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
import moment from 'moment'

export default {
  name: 'VersionListItem',
  props: {
    version: Object,
    vid: String,
    active: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    download_version(vid) {
      this.$emit('download', vid);
    },
    select_this() {
      this.$emit('click');
    },
    moment: function () {
      return moment();
    }
  },
  filters: {
    moment_from: function (date) {
      return moment(date).fromNow();
    }
  }
}
</script>
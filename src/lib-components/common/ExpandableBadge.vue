<template>
  <div
    class="badge badge-pill mr-2"
    :class="bootstrapColorClass"
  >
    <a
      href="#"
      class="text-decoration-none"
      :class="bootstrapTextClass"
      @click="$emit('click')"
    ><slot></slot> <i
      class="fas ml-1"
      :class="[ expanded ? 'fa-chevron-up' : 'fa-chevron-down' ]"
    ></i></a>
  </div>
</template>

<script>
export default {
	name: 'ExpandableBadge',
	props: {
		expanded: Boolean,
		color: {
			type: String,
			default: 'danger'
		},
		outline: {
			type: Boolean,
			default: true,
		}
	},
	computed: {
		bootstrapColorClass: function () {

			if ( this.outline && ! this.expanded ) {

				return [ 'bg-white', 'border', 'border-' + this.color ];

			}

			return [ 'border', 'border-' + this.color, 'badge-' + this.color ];

		},
		bootstrapTextClass: function () {

			if ( this.outline && ! this.expanded ) {

				return 'text-' + this.color;

			}

			return 'text-white';

		}
	}
};
</script>

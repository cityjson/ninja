<template>
  <div class="form-group row">
    <div class="input-group input-group-sm col">
      <div class="input-group-prepend">
        <span
          class="input-group-text"
        >{{ name }}</span>
      </div>
      <input
        ref="colorValue"
        type="color"
        class="form-control"
        :aria-describedby="name"
        :value="color"
        @input="updateColor"
      >
    </div>
  </div>
</template>

<script>
export default {
	name: 'ColorEditor',
	props: {
		value: {
			type: Number,
			default: 0xffffff
		},
		name: {
			type: String,
			default: "Color"
		}
	},
	computed: {
		color() {

			return '#' + this.value.toString( 16 ).padStart( 6, '0' );

		}
	},
	methods: {
		updateColor() {

			var new_color = parseInt( this.$refs.colorValue.value.substring( 1 ), 16 );
			this.$emit( 'input', new_color );

		}
	}
};
</script>

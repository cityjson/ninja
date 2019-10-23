<template>
  <div class="form-group row">
    <div class="input-group input-group-sm col">
      <div class="input-group-prepend">
        <span class="input-group-text" :id="name" :style="'color: #' + color">{{ name }}</span>
      </div>
      <input type="text" class="form-control" ref="colorValue" :aria-describedby="name" :value="color" @input="updateColor">
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorEditor',
  props: {
    value: Number,
    name: String
  },
  computed: {
    color() {
      return this.value.toString(16);
    }
  },
  methods: {
    updateColor() {
      var new_color=parseInt(this.$refs.colorValue.value, 16);
      this.$emit('input', new_color);
    }
  }
}
</script>
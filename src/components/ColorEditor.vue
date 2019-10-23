<template>
  <div>
    <div class="form-group row">
      <div class="input-group input-group-sm col">
        <div class="input-group-prepend">
          <span class="input-group-text" :id="name" :style="'color: #' + color.toString(16)">{{ name }}</span>
        </div>
        <input type="text" class="form-control" ref="colorValue" :aria-describedby="name" :value="color.toString(16)" @input="updateColor">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorEditor',
  props: {
    color: Number,
    name: String
  },
  method: {
    updateColor() {
      this.color=parseInt(this.$refs.colorValue.value, 16);
      this.$emit('input', this.color);
    }
  }
}
</script>
<template>
  <a
    href="#"
    class="sidebar-item"
    @click="optionClicked()"
  >
    <i
      class="fas sidebar-icon"
      :class="icon_class"
    ></i>
    <span>
      {{ text }}
    </span>
  </a>
</template>

<script>
export default {
	name: "SidebarItem",
	props: {
		icon: String,
		text: String
	},
	computed: {
		icon_class: function () {

			return "fa-" + this.icon;

		}
	},
	methods: {
		optionClicked() {

			this.$emit( 'click' );

		}
	}
};
</script>

<style scoped>
.sidebar-item {
    display: block;
    padding: 6px 5px 6px 10px;
    text-decoration: none;
    color: #ccc;
}
.sidebar-item:hover {
    color: #fff;
}
.sidebar-icon {
    width: 20px;
}
</style>

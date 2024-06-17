<template>
  <div>
    <small>
      <a
        v-if="geometry.type != 'GeometryInstance'"
        href="#"
        class="badge badge-pill bg-transparent border border-primary text-primary mr-1"
        :title="geometry.type"
      >
        LoD{{ geometry.lod }}
      </a>
      <span
        v-else
        class="badge badge-pill bg-transparent border border-secondary text-secondary mr-1"
      >
        <i class="fas fa-external-link-alt"></i>
      </span>
    </small>
  </div>
</template>

<script>
export default {
	name: 'GeometryBadge',
	props: {
		geometry: Object
	}
};
</script>

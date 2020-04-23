<template>
    <div class="col-12 h-100 text-white">
        <sidebar-item icon="cubes" text="Objects" @click="$emit('input', 'objects')"></sidebar-item>
        <sidebar-item icon="code-branch" text="Versions" @click="$emit('input', 'versions')" v-show="with_versions"></sidebar-item>
    </div>
</template>

<script>
import SidebarItem from './SidebarItem.vue'

export default {
    name: "NinjaSidebar",
    props: {
        value: {
            type: String,
            default: 'objects'
        },
        with_versions: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {}
    },
    components: {
        SidebarItem
    }
}
</script>
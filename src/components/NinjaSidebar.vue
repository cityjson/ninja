<template>
    <div class="col-12 h-100 text-white">
        <sidebar-item icon="cubes" text="Objects"></sidebar-item>
        <sidebar-item icon="code-branch" text="Versions"></sidebar-item>
    </div>
</template>

<script>
import SidebarItem from './SidebarItem.vue'

export default {
    name: "NinjaSidebar",
    data: function() {
        return {}
    },
    components: {
        SidebarItem
    }
}
</script>
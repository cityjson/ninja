<template>
  <div class="form-inline input-group my-2 my-lg-0">
    <div class="input-group-prepend">
      <label
        class="input-group-text"
        for="branchSelect"
      ><i class="fas fa-code-branch mr-1"></i> Branch</label>
    </div>
    <select
      id="branchSelect"
      class="custom-select"
      @change="$emit('input', $event.target.value)"
    >
      <option
        v-for="(version, branch) in versioning.branches"
        :key="branch"
      >
        {{ branch }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
	name: 'BranchSelector',
	props: {
		value: String,
		versioning: Object
	}
};
</script>

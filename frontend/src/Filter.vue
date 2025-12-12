<template>
    <div class="filter">
        <label for="status-filter">Filter by status:</label>
        <select id="status-filter" v-model="selectedStatus">
            <option value="">All</option>
            <option value="unimportant">Unimportant</option>
            <option value="serious">Serious</option>
            <option value="urgent">Urgent</option>
        </select>

    </div>
</template>
<script>
export default {
    data() {
        return {
            selectedStatus: ''
        }
    },
    watch: {
        selectedStatus(newStatus) {
            this.$emit('status-changed', newStatus);
        }
    }
}
</script>

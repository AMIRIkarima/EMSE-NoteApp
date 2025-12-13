<template>

    <div class="FilterWidget">
        <img class="filterImage" src="./assets/images/filter.svg" />

        <div class="filter-group">
            <button class="filter-btn all" :class="{ active: currentFilter === '' }" @click="filterNote('')">All</button>
            <button class="filter-btn unimportant" :class="{ active: currentFilter === 'unimportant' }" @click="filterNote('unimportant')">Unimportant</button>
            <button class="filter-btn serious" :class="{ active: currentFilter === 'serious' }" @click="filterNote('serious')">Serious</button>
            <button class="filter-btn urgent" :class="{ active: currentFilter === 'urgent' }" @click="filterNote('urgent')">Urgent</button>
        </div>

    </div>

</template>

<script>
  export default {  

    data() {
        return {
            currentFilter: ''
        }
    }, 

    emits: ['status-changed'],


    methods: {
        filterNote(filter) {
            this.currentFilter = filter
            this.$emit('status-changed', filter);
            
        }
    }
  } 
</script>



<style lang="scss" scoped>
@use 'sass:color';
@use 'assets/stylesheets/mediaQueryScreens.scss' as *;
@use 'assets/stylesheets/colors.scss' as appColors;

.FilterWidget {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    max-width: 1024px; 
    margin: 0 auto ; 
    justify-content: c; 
    padding-left: 50px;
    padding-bottom: 10px;
}

.filterImage {
    width: 24px;
    height: 24px;
    object-fit: contain;
    opacity: 0.9;
    box-sizing: border-box;
}

.filter-group {
    display: flex;
    gap: 2px;
    align-items: center;
    
}

.filter-btn {
    border-radius: 9999px;
    padding: 6px 14px;
    border: 1px solid transparent;
    background: white;
    cursor: pointer;
    font-weight: 400;
    font-size: 12px;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    color: #333;
    transition: all 120ms ease-in-out;
}


.filter-btn.all.active {
    background: #2f2f2f;
    color: #fff;
    border-color: #2f2f2f;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95);
}

.filter-btn.unimportant.active {
    background: appColors.$dark-green;
    color: #fff;
    border-color: appColors.$dark-green;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95);
}

.filter-btn.serious.active {
    background: appColors.$dark-yellow;
    color: #fff;
    border-color: appColors.$dark-yellow;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95);
}

.filter-btn.urgent.active {
    background: appColors.$dark-red;
    color: #fff;
    border-color: appColors.$dark-red;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95);
}

.filter-btn.all { border-color: #2f2f2f; color: #2f2f2f; }
.filter-btn.unimportant { border-color: appColors.$dark-green; color: appColors.$dark-green; }
.filter-btn.serious { border-color: appColors.$dark-yellow; color: appColors.$dark-yellow; }
.filter-btn.urgent { border-color: appColors.$dark-red; color: appColors.$dark-red; }


</style>
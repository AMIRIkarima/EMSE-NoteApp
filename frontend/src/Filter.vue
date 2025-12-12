<template>

    <div class="FilterWidget">
        
        <img class="filterImage" src="./assets/images/filter.svg" />

        <div class="widget">
            <button :class="{ active: currentFilter === 'all' }" @click="filterNote('all')" >All</button>
        </div>
        <div>
            <button :class="{ active: currentFilter === 'unimportant' }" @click="filterNote('unimportant')" >Unimportant</button>
        </div>
        <div>
            <button :class="{ active: currentFilter === 'serious' }" @click="filterNote('serious')" >Serious</button>
        </div>
        <div>
            <button :class="{ active: currentFilter === 'urgent' }" @click="filterNote('urgent')" >Urgent</button>
        </div>

    </div> 

</template>

<script>
  export default {  

    data() {
        return {
            currentFilter: 'all'
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
@use 'assets/stylesheets/noteCard.scss';

.FilterWidget{
    display : flex;
    border-radius: 30px;
    align-items: center;
    flex-wrap: wrap;
    padding-left: 10px;
    padding-right: 10px;
    min-width: 40px;
    justify-content: center;
}


    .unimportant{
    color: appColors.$dark-green;
    }
    .serious{
    color: appColors.$dark-yellow;
    }
    .urgent{
    color: appColors.$dark-red;
    }

</style>
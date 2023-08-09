<template>

  <v-navigation-drawer v-model="app.navDrawer" width="150"
                       permanent
                       rail>
    <v-card
      class="mx-auto"
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-home"
          title="Home"
          :to="{ name: 'Home'}"
        ></v-list-item>

        <v-list-item
          v-for="([title, icon, to], i) in calcRoutes"
          :key="i"
          :title="title"
          :prepend-icon="icon"
          :value="title"
          :to="to"
        ></v-list-item>

      </v-list>
    </v-card>
  </v-navigation-drawer>

</template>

<script setup>
import {ref} from 'vue'
import {useAppStore} from '@/store/app.js'

const app = useAppStore()

const calcRoutes = ref([
  ['Estimates', 'mdi-calculator', {name: "GeniusEstimates"}],
])

</script>

<style scoped>
  .v-list-item--active {
    color: darkorange;
  }
</style>

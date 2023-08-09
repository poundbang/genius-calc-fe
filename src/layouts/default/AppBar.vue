<template>

  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="app.navDrawer = !app.navDrawer"></v-app-bar-nav-icon>
      <v-img src="/logo.svg" :width="40"></v-img>
    </template>
    <v-app-bar-title></v-app-bar-title>
    <template v-slot:title>
      {{ msg }}
    </template>
  </v-app-bar>

</template>

<script setup>
import {ref} from 'vue'
import { useAppStore } from '@/store/app.js'


const app = useAppStore()
const msg = ref('Genius Calculators')
</script>

<style scoped>

.v-app-bar.v-toolbar {
  color: darkorange;
}

</style>

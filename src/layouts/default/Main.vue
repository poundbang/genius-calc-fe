<template>
  <v-app>
    <AppBar/>
    <AppNavDrawer/>
    <AppView/>
  </v-app>
</template>

<script setup>
import AppBar from './AppBar.vue'
import AppView from './AppView.vue'
import AppNavDrawer from "./AppNavDrawer.vue";
</script>

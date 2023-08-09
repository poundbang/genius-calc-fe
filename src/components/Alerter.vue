<script setup>
import {useAppStore} from '@/store/app'
import {storeToRefs} from "pinia";
import {computed, ref, watch} from "vue";

const appStore = useAppStore()

const {alerter} = storeToRefs(appStore)
const showAlertMsg = ref(false)

watch(alerter, () => {
  showAlertMsg.value = true
})

const title = computed( () => {
 return [alerter.value.facility, new Date(alerter.value.time).toLocaleString()].join("-")
})
</script>

<template>
  <v-container fluid>
    <v-sheet>
      <v-alert v-if="showAlertMsg"
               closable
               variant="outlined"
               icon="mdi-alert"
               :type=alerter.type
               :title=title
               :text=alerter.msg
      ></v-alert>
    </v-sheet>
  </v-container>
</template>

<style scoped>
</style>

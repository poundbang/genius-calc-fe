<script setup>

import {ref, watch} from "vue";
import { useCalcStore } from '@/store/calc'
import AssetPrice from "@/components/AssetPrice.vue";

const calcStore = useCalcStore()
const networkList = ['ethereum', 'avalanche', "polygon", "bsc"]
const network = ref('')

// Functions
const resetStore = () => {
  calcStore.reset()
}
const setStoreNetwork = () => {
  calcStore.network = network.value
}

// Watchers
watch(network, async () => {
  if (network.value !== '') {
    resetStore();
    setStoreNetwork();
  }
})

</script>
<template>
  <v-card
    class="mx-auto"
    width="850"
    prepend-icon="mdi-network"

  >
    <template v-slot:title>
      Estimate for Network
    </template>
    <v-card-text>
      <v-row justify="space-evenly" align="center">
        <v-col md="4">
          <AssetPrice kind="geni"/>
        </v-col>
        <v-col md="4">
          <v-select
            color="orange"
            variant="outlined"
            v-model="network"
            :items="networkList"
            label="Network"
          ></v-select>
        </v-col>
        <v-col md="4">
          <AssetPrice kind="native"/>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

</template>
<style scoped>

</style>

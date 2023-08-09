<script setup>
import {computed, watch, defineProps, ref} from "vue";
import { useCalcStore } from '@/store/calc'
import {useFetch} from "@vueuse/core";
import {storeToRefs} from "pinia";

const calcStore = useCalcStore()
const {network} = storeToRefs(calcStore)
const props = defineProps({
  kind: {
    type: String,
    required: true,
  }
})

const dexScreenerTopUrl = 'https://api.dexscreener.com/latest/dex/pairs'
const dexScreenerPairs = {
  'ethereum': '0xc58d0b5f25633e37e8d0cc9a2c82c4397e1f826b',
  'bsc': '0xbcdabe15ac57fe53e8822efd2ad11254905af11a',
  'polygon': '0x393c3a9a62d5d42e4d3199c7355bd26a479b4cc2',
  'avalanche': '0x57e0278f66de0cdf36515db31c646fd6cba15823'
}
const CGTopUrl = 'https://api.coingecko.com/api/v3/simple/price'
const cgNet2Native = {
  "ethereum": 'ethereum',
  "polygon": "matic-network",
  "avalanche": "avalanche-2",
  "bsc": "binancecoin"
}
let feedRes = {isFetching: false, feedError: null, feedData: null}
const geniPrice = ref(0)
const nativePrice = ref(0)
const priceGeniInputReadOnly = ref(true)
const priceNativeInputReadOnly = ref(true)

const getPriceGeni = async () => {
  feedRes = await useFetch(dexPairUrl, {method: 'GET'}).json()
  if (feedRes.error.value) {
    console.log(feedRes.error.value)
  }else{
    // calcStore.prices.geni= Number(feedRes.data.value.pairs[0].priceNative)
    geniPrice.value = Number(feedRes.data.value.pairs[0].priceNative)
  }
}
// Computed
const dexPairUrl = computed(() => {
  return [dexScreenerTopUrl, network.value, dexScreenerPairs[network.value]].join('/')
})


const getPriceNative = async () => {
  feedRes = await useFetch(cgPairUrl , {method: 'GET'}).json()
  if (feedRes.error.value) {
    console.log(feedRes.error.value)
  }else{
    // calcStore.prices.native = Number(feedRes.data.value[cgNet2Native[network.value]]["usd"])
    nativePrice.value = Number(feedRes.data.value[cgNet2Native[network.value]]["usd"])
  }
}

const cgPairUrl = computed(() => {
  const params = {
    ids: cgNet2Native[network.value], vs_currencies: "usd"
  }
  const cgNativeQueryURL = new URL(CGTopUrl);
  cgNativeQueryURL.search = new URLSearchParams(params);
  return cgNativeQueryURL.toString()
})


watch(geniPrice, async () => {
  console.log("geniprice changed")
  calcStore.prices.geni = Number(geniPrice.value)
})
watch(nativePrice, async () => {
  calcStore.prices.native = Number(nativePrice.value)
})

watch(network, async () => {
  if (network.value !== '') {
    switch (props.kind){
      case "geni": {
        console.warn(`Asset: ${props.kind}`)
        getPriceGeni();
        break;
      }
      case "native": {
        console.warn(`Asset: ${props.kind}`)
        getPriceNative();
        break;
      }
    }
  }
})

const enableGeniPriceMod = () => { priceGeniInputReadOnly.value = false }
const enableNativePriceMod = () => { priceNativeInputReadOnly.value = false }
</script>

<template>
  <v-sheet v-if="(props.kind === 'geni' && geniPrice)">
    <v-text-field
                  variant="outlined"
                  :readonly="priceGeniInputReadOnly"
                  v-model="geniPrice"
                  class="text-green-accent-1"
                  label="Geni Price ($)"
                  append-inner-icon="mdi-pen"
                  @click:append-inner="enableGeniPriceMod()"
    ></v-text-field>
  </v-sheet>
  <v-sheet v-else-if="(props.kind === 'native' && nativePrice)">
    <v-text-field
                  variant="outlined"
                  :readonly="priceNativeInputReadOnly"
                  v-model="nativePrice"
                  class="text-green-accent-1"
                  label="Native Price ($)"
                  append-inner-icon="mdi-pen"
                  @click:append-inner="enableNativePriceMod()"
    ></v-text-field>
  </v-sheet>
  <v-sheet v-else>
  </v-sheet>

</template>

<style scoped>
</style>

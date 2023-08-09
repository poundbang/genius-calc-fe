<script setup>
import {ref, reactive, watch, computed} from 'vue'
import {useCalcStore} from '@/store/calc'
import {storeToRefs} from "pinia";
import {useFetch} from "@vueuse/core";
import {newAlert} from "@/utils/alert";

const calcStore = useCalcStore()
const { network, prices } = storeToRefs(calcStore)
const gform = ref(null)

// const shareApiTopUrl = 'https://127.0.0.1:8443/shareRate'
const shareApiTopUrl = 'https://api.geni.best/shareRate'
let feedRes = {isFetching: false, feedError: null, feedData: null}

//Defaults
const phi = 1.618033989
const shareRateMin = 2618.03
const daysToMineMax = 4444
const daysToMineMin = 90
const fundsToAllocateMin = 0
const fundsToAllocateMax = 1000000
const geniToMineMin = 0
const geniToMineMax = Math.floor(12 * 10 ** 9) // 128 Billion

const defaultParams = {
  fundsToAllocate: 0,
  geniToMine: 0,
  daysToMine: daysToMineMin,
  // TODO: fetch from chain
  shareRate: shareRateMin,
  geniValue: 0,
}
const params = reactive({...defaultParams})

const helpMessage = ref("")
const helpMessageView = ref(false)
const helpText = reactive({
  fundsToAllocate: "USD equivalent to mine.This number cannot be larger than $1M USD.",
  geniToMine: "This number cannot be larger than the number in supply.  To be safe, keep this number under 128 Billion GENI",
  daysToMine: "This number must be greater than 0 and no larger than 4444",
  shareRate: "Current share rate. Current share rate can be viewed in the performance tab."
})

const results = reactive({
  vals: {
    promiseDayBonus: 0,
    geniusSizeBonus: 0,
    effectiveGenius: 0,
    sharesAwarded: 0
  }
})

// Funds to allocate
const fundsToAllocateRules = [
  value => {
    if (parseInt(value) >= fundsToAllocateMin && parseInt(value) <= fundsToAllocateMax) return true

    return '$ must be less than 1M USD.'
  },
]
// Geni to Mine
const geniToMineRules = [
  value => {
    if (parseInt(value) >= geniToMineMin && parseInt(value) <= geniToMineMax) return true

    return '# must be 1+ and less than 12B GENI.'
  },
]
// Days to Mine
const daysToMineRules = [
  value => {
    if (value) return true

    return '# is required.'
  },
  value => {
    if (parseInt(value) >= daysToMineMin && parseInt(value) <= daysToMineMax) return true

    return '# must be 90 to 4444'
  },
]

const shareApiUrl = computed(() => {
    return [shareApiTopUrl, network.value].join('/')
})

// const geniPrice = computed(() => {
//   return calcStore.prices.geni
// })
const geniToMineUSD = computed(() => {
  return `approx: = $ ${calcStore.principal.geniToMineUSD}`
})

const promiseDayBonusFmt = computed( () => {
  return results.vals.promiseDayBonus.toLocaleString()
})
const geniusSizeBonusFmt = computed( () => {
  return results.vals.geniusSizeBonus.toLocaleString()
})
const effectiveGeniusFmt = computed( () => {
  return results.vals.effectiveGenius.toLocaleString()
})
const sharesAwardedFmt = computed( () => {
  return results.vals.sharesAwarded.toLocaleString()
})

const resetToDefault = () => {
  params.geniToMine = 0
  params.fundsToAllocate = 0
  params.daysToMine = daysToMineMin

  calcStore.principal.geniToMine = 0
  calcStore.principal.geniToMineUSD = 0
  calcStore.principal.duration = daysToMineMin
  calcStore.rewards.shares = 0
  if (gform.value != null)
    gform.value.resetValidation()
}

const recalc = (newV) => {
  if (newV.fundsToAllocate > 0) {
    // params.geniToMine = newV.fundsToAllocate / geniPrice.value
    params.geniToMine = newV.fundsToAllocate / prices.value.geni
  }
  // params.geniValue = Number(newV.geniToMine * geniPrice.value)
  params.geniValue = Number(newV.geniToMine * prices.value.geni)
  results.vals.promiseDayBonus = Math.min(
    newV.geniToMine * phi ** phi,
    newV.geniToMine * (Math.min(Math.max(newV.daysToMine, 1), 4444) / 1456))

  results.vals.geniusSizeBonus = newV.geniToMine * Math.min(newV.geniToMine, phi / 10 * 10 ** 9) / 10 ** 9
  results.vals.effectiveGenius = +newV.geniToMine + +results.vals.promiseDayBonus + +results.vals.geniusSizeBonus
  results.vals.sharesAwarded = +results.vals.effectiveGenius / +newV.shareRate

  // Expose to global
  calcStore.rewards.shares = Number(results.vals.sharesAwarded)
  calcStore.principal.geniToMine = Number(newV.geniToMine)
  // calcStore.principal.geniToMineUSD = Number(Number(newV.geniToMine * geniPrice.value).toPrecision(2))
  calcStore.principal.geniToMineUSD = Number(Number(newV.geniToMine * prices.value.geni).toPrecision(2))
  calcStore.principal.duration = Number(newV.daysToMine)
}

watch(params, (newV, oldV) => {
  recalc(newV)
})

watch(prices, (newV, oldV) => {
  resetToDefault()
}, {deep: true})
const getHelpForField = (what) => {
  helpMessageView.value = true
  helpMessage.value = helpText[what]
}

const getShareRate = async () => {
  feedRes = await useFetch(shareApiUrl, {method: 'GET'}).json()
  if (feedRes.error.value) {
    newAlert( {facility: "API-ShareRate", type:"error", msg: `API Network Error: ${feedRes.error.value}`})
  } else {
    // Check api error
    if (feedRes.data.value.error != null) {
      newAlert({facility: "API-ShareRate", type:"error", msg: `API App Error: ${feedRes.data.value.error}`})
    }else{
      calcStore.principal.shareRate = Number((feedRes.data.value.content / Math.pow(10, 9) ).toFixed(2))
      params.shareRate = calcStore.principal.shareRate
    }
  }
}

watch(network, (newV, oldV) => {
   resetToDefault()
   getShareRate()
})


</script>

<style scoped>

</style>

<template>
  <v-card
    class="mx-auto bg-blue-grey-darken-4"
    width="850"
    prepend-icon="mdi-calculator"
    v-if="network"
  >
    <template v-slot:title>
      Mining Principal and IQ Shares
    </template>
    <v-card-text>
      <v-form ref="gform">
        <v-row dense justify="space-evenly">
          <v-col
            md="3"
          >

            <v-text-field
              append-icon="mdi-help-circle-outline"
              variant="outlined"
              @click:append="getHelpForField('fundsToAllocate')"
              color="orange"
              v-model="params.fundsToAllocate"
              :rules="fundsToAllocateRules"
              label="Funds To Allocate"
              type="number"
            >
            </v-text-field>
          </v-col>
          <v-col
            md="4"
          >

            <v-text-field
              append-icon="mdi-help-circle-outline"
              variant="outlined"
              @click:append="getHelpForField('geniToMine')"
              color="orange"
              v-model="params.geniToMine"
              :rules="geniToMineRules"
              label="GENI To Mine"
              type="number"
              :hint="geniToMineUSD"
              required
            >
            </v-text-field>
          </v-col>
          <v-col
            md="3"
          >
            <v-text-field
              append-icon="mdi-help-circle-outline"
              variant="outlined"
              @click:append="getHelpForField('daysToMine')"
              color="orange"
              v-model="params.daysToMine"
              :rules="daysToMineRules"
              label="Days To Mine"
              type="number"
              required

            >
            </v-text-field>
          </v-col>
          <v-col md="2"> Share Rate:
            <pre> {{ params.shareRate.toLocaleString() }}</pre>
          </v-col>
        </v-row>
        <v-alert v-show="helpMessageView" model-value :text.value="helpMessage" variant="plain"></v-alert>
      </v-form>
      <v-row dense justify="space-evenly">
        <v-col md="3" class="justify-center">
          <v-card variant="elevated">
            <h5 class="text-center">Promise Bonus</h5>
            <v-card-text class="text-h5 text-center" v-text="promiseDayBonusFmt"></v-card-text>
          </v-card>
        </v-col>
        <v-col md="3" class="justify-center">
          <v-card variant="elevated">
            <h5 class="text-center">Size Bonus</h5>
            <v-card-text class="text-h5 text-center" v-text="geniusSizeBonusFmt"></v-card-text>
          </v-card>
        </v-col>
        <v-col md="3" class="justify-center">
          <v-card variant="elevated">
            <h5 class="text-center">Effective Genius</h5>
            <v-card-text class="text-h5 text-green-darken-2 text-center"
                         v-text="effectiveGeniusFmt"></v-card-text>
          </v-card>
        </v-col>
        <v-col md="3" class="justify-center">
          <v-card variant="elevated">
            <h5 class="text-center">Awarded Shares</h5>
            <v-card-text class="text-h5 text-amber-darken-2 text-center"
                         v-text="sharesAwardedFmt"></v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

</template>

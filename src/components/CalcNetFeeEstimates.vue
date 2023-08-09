<script setup>
import {computed, ref, watch} from "vue";
import {useCalcStore} from '@/store/calc'
import {storeToRefs} from "pinia";
import {useFetch} from "@vueuse/core";
import {newAlert} from "@/utils/alert";

const calcStore = useCalcStore()
const {network} = storeToRefs(calcStore)
const formValid = false
let feedRes = {isFetching: false, feedError: null, feedData: null}

// Contracts
const geniusContract = '0x444444444444C1a66F394025Ac839A535246FCc8'
const miningContract = '0x4444444ffA9bD8AF854Ea4E353756b06472F4444'
// Function signatures
const newMinerMethodSig = '2ac2dfd2'
const endMinerMethodSig = '57ec85dd'
// current gas cost api endpoint
//const gasCurrentApi = 'https://127.0.0.1:8443/gas/'
const gasCurrentApi = 'https://api.geni.best/gas/'
// historic gas cost api endpoint
//const gasHistoryApi = 'https://127.0.0.1:8443/tx/gas/history/'
const gasHistoryApi = 'https://api.geni.best/tx/gas/history/'


// selected current gas price
const gasRate = ref(0)

// current gas cost list
const networkGasList = ref([])

// new miner historic gas cost list
const networkStartGasHistoryList = ref([])
// new miner historic gas cost average
const networkStartGasHistoryAvg = ref(0)
// new miner historic gas cost max
const networkStartGasHistoryMaxA = ref(0)

// end miner historic gas cost list
const networkEndGasHistoryList = ref([])
// end miner historic gas cost average
const networkEndGasHistoryAvg = ref(0)
const networkEndGasHistoryMaxT = ref(0)
const networkEndGasHistoryMaxA = ref(0)

const startCostAvg = ref(0)
const startCostMaxA = ref(0)
const endCostAvg = ref(0)
const endCostMaxA = ref(0)
const endCostMaxT = ref(0)
const lockedCostAvg = ref(0)
const lockedCostMaxA = ref(0)
const lockedCostMaxT = ref(0)

const showDetails = ref(false)
const resetGas = () => {
  gasRate.value = 0
}

const filterByMethodSig = (apiGasHistList, methodSig) => {
  let gasSubList = apiGasHistList
    .filter(e => e.smartContractMethod.signatureHash === methodSig)
    .map(e => e.transaction.gas)
  console.log(`Gas cost list for ${methodSig} is: ${gasSubList}`)
  return gasSubList
}
const getCurrGasList = async () => {
  const currGasUrl = gasCurrentApi + network.value
  //  networkGasList.value = await apiDriver(currGasUrl)
  feedRes = await useFetch(currGasUrl, {method: 'GET'}).json()
  // console.log(networkGasList.value)

  if (feedRes.error.value) {
    newAlert({facility: "API-NetFees", type: "error", msg: `API Network Error: ${feedRes.error.value}`})
  } else {
    // Check api error
    if (feedRes.data.value.error != null) {
      newAlert({facility: "API-NetFees", type: "error", msg: `API App Error: ${feedRes.data.value.error}`})
    } else {
      // Take second to last gas rate (medium-high degree of acceptance)
      networkGasList.value = feedRes.data.value.content
      let gasRateMed = networkGasList.value.slice(-2).slice(0, 1)[0].gasPrice
      console.log("Gas Rate Med: ", gasRateMed)
      setGasRate(gasRateMed);
    }
  }
}

const getHistGasList = async (filterCB) => {
  const histStartGasUrl = gasHistoryApi + network.value + "/" + miningContract
  const histEndGasUrl = gasHistoryApi + network.value + "/" + geniusContract

  // let apiStartGasHistList = await apiDriver(histStartGasUrl)
  feedRes = await useFetch(histStartGasUrl, {method: 'GET'}).json()
  if (feedRes.error.value) {
    newAlert({facility: "API-NetFees", type: "error", msg: `API Network Error: ${feedRes.error.value}`})
  } else {
    // Check api error
    if (feedRes.data.value.error != null) {
      newAlert({facility: "API-NetFees", type: "error", msg: `API App Error: ${feedRes.data.value.error}`})
    } else {
      networkStartGasHistoryList.value = filterCB(feedRes.data.value.content, newMinerMethodSig)
      networkStartGasHistoryAvg.value = networkStartGasHistoryList.value.reduce((n, o) => (n + o)) / networkStartGasHistoryList.value.length;
      networkStartGasHistoryMaxA.value = Math.max(...networkStartGasHistoryList.value)

      // Expose globally
      calcStore.fees.networkStartGasHistoryAvg = networkStartGasHistoryAvg.value
    }
  }

  // let apiEndGasHistList = await apiDriver(histEndGasUrl)

  feedRes = await useFetch(histEndGasUrl, {method: 'GET'}).json()
  if (feedRes.error.value) {
    newAlert({facility: "API-NetFees", type: "error", msg: `API Network Error: ${feedRes.error.value}`})
  } else {
    // Check api error
    if (feedRes.data.value.error != null) {
      newAlert({facility: "API-NetFees", type: "error", msg: `API App Error: ${feedRes.data.value.error}`})
    } else {
      networkEndGasHistoryList.value = filterCB(feedRes.data.value.content, endMinerMethodSig)
      networkEndGasHistoryAvg.value = networkEndGasHistoryList.value.reduce((n, o) => (n + o)) / networkEndGasHistoryList.value.length;
      networkEndGasHistoryMaxA.value = Math.max(...networkEndGasHistoryList.value)
      networkEndGasHistoryMaxT.value = networkEndGasHistoryAvg.value * 39 / 20

      // Expose globally
      calcStore.fees.networkEndGasHistoryAvg = networkEndGasHistoryAvg.value
      calcStore.fees.networkEndGasHistoryMaxA = networkEndGasHistoryMaxA.value
      calcStore.fees.networkEndGasHistoryMaxT = networkEndGasHistoryMaxT.value
    }
  }

}

const nativePrice = computed(() => {
  return calcStore.prices.native
})

const calcStartCostAvg = () => {
  startCostAvg.value = (networkStartGasHistoryAvg.value
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // console.log(networkStartGasHistoryAvg.value)
  // console.log(gasRate.value / Math.pow(10, 9))
  // console.log(nativePrice.value)

  // Expose globally
  calcStore.fees.startCostAvg = Number(startCostAvg.value)
}
const calcStartCostMaxA = () => {
  startCostMaxA.value = (networkStartGasHistoryMaxA.value
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
}

const calcEndCostAvg = () => {
  endCostAvg.value = (networkEndGasHistoryAvg.value
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // Expose globally
  calcStore.fees.endCostAvg = Number(endCostAvg.value)
}

const calcEndCostMaxA = () => {
  endCostMaxA.value = (networkEndGasHistoryMaxA.value
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // Expose globally
  calcStore.fees.endCostMaxA = Number(endCostMaxA.value)
}

const calcEndCostMaxT = () => {
  endCostMaxT.value = (networkEndGasHistoryMaxT.value
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // Expose globally
  calcStore.fees.endCostMaxT = Number(endCostMaxT.value)
}

const calcLockedCostAvg = () => {
  lockedCostAvg.value = ((networkStartGasHistoryAvg.value + networkEndGasHistoryAvg.value)
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // Expose globally
  calcStore.fees.lockedCostAvg = Number(lockedCostAvg.value)
}
const calcLockedCostMaxA = () => {
  lockedCostMaxA.value = ((networkStartGasHistoryAvg.value + networkEndGasHistoryMaxA.value)
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // Expose globally
  calcStore.fees.lockedCostMaxA = Number(lockedCostMaxA.value)
}
const calcLockedCostMaxT = () => {
  lockedCostMaxT.value = ((networkStartGasHistoryAvg.value + networkEndGasHistoryMaxT.value)
    * (gasRate.value / Math.pow(10, 9)) // convert Wei to Eth
    * nativePrice.value).toPrecision(2)
  // Expose globally
  calcStore.fees.lockedCostMaxT = Number(lockedCostMaxT.value)
}

const setGasRate = (gasPrice) => {
  gasRate.value = Number(gasPrice.toFixed(1));
  console.log("gasRate set to : ", gasRate.value)
}
const calcGasCost = (gasCostChoice) => {
  console.log('gasCostChoice: ', gasCostChoice.gasPrice)
  setGasRate(gasCostChoice.gasPrice)
  calcCost()
}
const calcCost = () => {
  calcStartCostAvg()
  calcStartCostMaxA()
  calcEndCostAvg()
  calcEndCostMaxA()
  calcEndCostMaxT()
  calcLockedCostAvg()
  calcLockedCostMaxA()
  calcLockedCostMaxT()
}

const estimateFees = async () => {
  network.value = calcStore.network
  resetGas();
  getCurrGasList();
  await getHistGasList(filterByMethodSig);
  calcCost()
}

watch(network, (newV, oldV) => {
  console.log("Fees: network changed: ", network.value)
  estimateFees()
})

</script>


<template>
  <v-card
    class="mx-auto bg-blue-grey-darken-4"
    width="850"
    prepend-icon="mdi-car"
    v-if="network"
  >
    <template v-slot:title>
      Gas Fees and Cost to Mine
    </template>
    <v-card-text>
      <v-row justify="center">
        <v-form ref="eform" v-model="formValid">
          <v-container>
            <v-row dense justify="center">
              <v-col>
                <v-row v-if="gasRate" dense justify="center">
                  <v-card>
                    <v-card-text v-model="gasRate">
                      <v-row>
                        <v-col class="bg-blue-grey-darken-3"> Target Gas (Avg) : <span class="text-h6"> {{
                            (gasRate > 0) ? gasRate : "..."
                          }} </span> Gwei
                        </v-col>
                        <v-col class="bg-blue-grey-darken-3"> Miner Start (Avg): <span class="text-h6"> ${{
                            (startCostAvg > 0) ? startCostAvg : "..."
                          }} </span> USD
                        </v-col>
                        <v-col class="bg-blue-grey-darken-3"> Miner Stop (Avg): <span class="text-h6"> ${{
                            (endCostAvg > 0) ? endCostAvg : "..."
                          }} </span> USD
                        </v-col>
                        <v-col class="bg-blue-grey-darken-3">
                          <v-btn variant="outlined" class="text-amber" @click="showDetails=!showDetails">
                            Details/Adjust
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-row>
                <v-row dense v-show="showDetails">
                  <v-col v-for="item in networkGasList"
                         :key="item.acceptance"
                  >
                    <v-card>
                      <v-card-title> Gas: {{ Number(item.gasPrice.toFixed(1)) }} Gwei</v-card-title>
                      <v-card-subtitle> Acceptance: {{ item.acceptance * 100 }}%</v-card-subtitle>
                      <v-card-actions>
                        <v-btn variant="outlined" class="text-blue-darken-3" @click="calcGasCost(item)">
                          Re-Calculate Cost
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>

                </v-row>
                <v-row dense v-show="showDetails">
                  <v-col v-if="networkStartGasHistoryList.length > 0 && gasRate >0 " md="5" class="ma-2 pa-2">
                    <v-card class="bg-blue-grey-darken-2">
                      <v-card-title v-model="networkStartGasHistoryAvg">
                        Start Miner Estimate Fee
                      </v-card-title>
                      <v-card-item>
                        <v-table density="compact">
                          <tbody>
                          <tr>
                            <td rowspan="2">Avg</td>
                            <td>Gwei:</td>
                            <td class="text-h5">{{ networkStartGasHistoryAvg }}</td>
                          </tr>
                          <tr>
                            <td>USD:</td>
                            <td class="text-h5">${{ startCostAvg }}</td>
                          </tr>
                          <tr>
                            <td rowspan="2">MaxA</td>
                            <td>Gwei:</td>
                            <td class="text-h5">{{ networkStartGasHistoryMaxA }}</td>
                          </tr>
                          <tr>
                            <td>USD:</td>
                            <td class="text-h5">${{ endCostMaxA }}</td>
                          </tr>
                          </tbody>
                        </v-table>
                      </v-card-item>
                    </v-card>
                  </v-col>

                  <v-col v-if="networkEndGasHistoryList.length > 0 && gasRate >0" md="6" class="ma-2 pa-2">
                    <v-card class="bg-blue-grey-darken-2">
                      <v-card-title>End Miner Estimate Fee</v-card-title>
                      <v-card-item>
                        <v-table density="compact">
                          <tbody>
                          <tr>
                            <td rowspan="2">Avg</td>
                            <td>Gwei:</td>
                            <td class="text-h5">{{ networkEndGasHistoryAvg }}</td>
                          </tr>
                          <tr>
                            <td>USD:</td>
                            <td class="text-h5">${{ endCostAvg }}</td>
                          </tr>
                          <tr>
                            <td rowspan="2">MaxA</td>
                            <td>Gwei:</td>
                            <td class="text-h5">{{ networkEndGasHistoryMaxA }}</td>
                          </tr>
                          <tr>
                            <td>USD:</td>
                            <td class="text-h5">${{ endCostMaxA }}</td>
                          </tr>
                          <tr>
                            <td rowspan="2">MaxT</td>
                            <td>Gwei:</td>
                            <td class="text-h5">{{ networkEndGasHistoryMaxT }}</td>
                          </tr>
                          <tr>
                            <td>USD:</td>
                            <td class="text-h5">${{ endCostMaxT }}</td>
                          </tr>
                          </tbody>
                        </v-table>
                      </v-card-item>
                    </v-card>
                  </v-col>

                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-row>
    </v-card-text>
  </v-card>

</template>

<style scoped>
</style>

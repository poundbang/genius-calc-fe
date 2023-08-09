<script setup>
import {computed, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useCalcStore} from '@/store/calc'
import {newAlert} from "@/utils/alert";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend, Colors,
} from 'chart.js'

import {Line} from 'vue-chartjs'
import {useFetch} from "@vueuse/core";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
)

// const advPpsApiTopUrl = 'https://127.0.0.1:8443/advPps'
const advPpsApiTopUrl = 'https://api.geni.best/advPps'
let feedRes = {isFetching: false, feedError: null, feedData: null}

const calcStore = useCalcStore()
const {network} = storeToRefs(calcStore)
const {principal} = storeToRefs(calcStore)
const {fees} = storeToRefs(calcStore)
const netAvg = ref(0)
const netMaxA = ref(0)
const netMaxT = ref(0)

const profitableAvg = ref(0)
const profitableMaxA = ref(0)
const profitableMaxT = ref(0)

const netAPYAvg = ref(0)
const netAPYMaxA = ref(0)
const netAPYMaxT = ref(0)

const netAvgPositive = ref(0)
const netMaxAPositive = ref(0)
const netMaxTPositive = ref(0)

const profitBreak = ref(900)
const data = ref({
  datasets: []
})

let geniAdvPPS = ref(0);
let geniAdvPPSMin = 0.01;
let geniAdvPPSMax = 2;

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      border: {
        display: true,
      },
      grid: {
        display: true,
        drawOnChartArea: true,
        drawTicks: true,
        color: function (context) {
          if (context.tick.value === profitBreak.value) {
            return '#86e71f';
          }
          return '#2c2c2c';
        },
      }
    },
    y: {
      border: {
        display: true
      },
      grid: {
        display: true,
        drawOnChartArea: true,
        color: function (context) {
          if (context.tick.value === 0) {
            return '#86e71f';
          }
          return '#2c2c2c';
        },
      },
    }
  }
}

const daysLabels = computed(() => {
  return lockedDaysLookup.value.map(e => e.day)
})
const profitDatasetAvg = computed(() => {
  return lockedDaysLookup.value.map(e => e.netAvg)
})
const profitDatasetMaxA = computed(() => {
  return lockedDaysLookup.value.map(e => e.netMaxA)
})
const profitDatasetMaxT = computed(() => {
  return lockedDaysLookup.value.map(e => e.netMaxT)
})

const chartData = () => ({
  labels: daysLabels.value,
  datasets: [
    {
      label: 'Profit Day (Avg) ',
      backgroundColor: '#6969da',
      data: profitDatasetAvg.value
    },
    {
      label: 'Profit Day (MaxA)',
      backgroundColor: '#ee9506',
      data: profitDatasetMaxA.value
    },
    {
      label: 'Profit Day (MaxT)',
      backgroundColor: '#f87979',
      data: profitDatasetMaxT.value
    }
  ]
})


const generateGraph = () => {
  data.value = chartData()
}
let lockedDaysLookup = ref([])

const advPpsApiUrl = computed(() => {
  return [advPpsApiTopUrl, network.value].join('/')
})

const getAdvPps = async () => {
  feedRes = await useFetch(advPpsApiUrl, {method: 'GET'}).json()
  // Check network error
  if (feedRes.error.value) {
   newAlert( {facility: "API-PPS", type:"error", msg: `API Network Error: ${feedRes.error.value}`})
  } else {
    // Check api error
    if (feedRes.data.value.error != null) {
      newAlert({facility: "API-PPS", type:"error", msg: `API App Error: ${feedRes.data.value.error}`})
    }else{
      calcStore.rewards.advPps = Number((feedRes.data.value.content / Math.pow(10, 10)).toFixed(2))
      geniAdvPPS.value = calcStore.rewards.advPps
    }
  }
}

const calcLockedGross = (day) => {
  return (day
    * geniAdvPPS.value
    * calcStore.rewards.shares
    * calcStore.prices.geni)
}

const generateLockedDaysLookup = async () => {
  const minDays = 90, maxDays = 4440, stepDays = 30;
  lockedDaysLookup.value = []
  for (let i = minDays; i <= maxDays; i += stepDays) {
    let gross = Number(calcLockedGross(i).toFixed(2))
    let netAvg = Number((gross - fees.value.lockedCostAvg).toFixed(2))
    let netMaxT = Number((gross - fees.value.lockedCostMaxT).toFixed(2))
    let netMaxA = Number((gross - fees.value.lockedCostMaxA).toFixed(2))
    let lockedDaysRec = {
      "day": i,
      "gross": gross,
      "costAvg": calcStore.fees.lockedCostAvg,
      "costMaxA": calcStore.fees.lockedCostMaxA,
      "costMaxT": calcStore.fees.lockedCostMaxT,
      "netAvg": netAvg,
      "netMaxA": netMaxA,
      "netMaxT": netMaxT,
      "profitAvg": (netAvg > 0),
      "profitMaxT": (netMaxT > 0),
      "profitMaxA": (netMaxA > 0)
    }
    lockedDaysLookup.value.push(lockedDaysRec)
  }

  console.log("Locked Days Lookup: ", lockedDaysLookup)
}

const getNetAvg = (targetDay) => lookupNetByDay(targetDay).netAvg;
const getNetMaxA = (targetDay) => lookupNetByDay(targetDay).netMaxA
const getNetMaxT = (targetDay) => lookupNetByDay(targetDay).netMaxT
const getProfitableAvg = (targetDay) => lookupNetByDay(targetDay).profitAvg;
const getProfitableMaxA = (targetDay) => lookupNetByDay(targetDay).profitMaxA;
const getProfitableMaxT = (targetDay) => lookupNetByDay(targetDay).profitMaxT;
const getNetAPYAvg = (targetDay) => {
  return Number(getNetAvg(targetDay) / principal.value.geniToMineUSD / targetDay * 365 * 100).toPrecision(2)
}
const getNetAPYMaxT = (targetDay) => {
  return Number(getNetMaxT(targetDay) / principal.value.geniToMineUSD / targetDay * 365 * 100).toPrecision(2)
}
const getNetAPYMaxA = (targetDay) => {
  return Number(getNetMaxA(targetDay) / principal.value.geniToMineUSD / targetDay * 365 * 100).toPrecision(2)
}
const getNetAvgPositive = () => {
  return lookupNetAvgPositive().day;
};
const getNetMaxTPositive = () => lookupNetMaxTPositive().day;
const getNetMaxAPositive = () => lookupNetMaxAPositive().day;

const lookupNetByDay = (targetDay) => {
  return lockedDaysLookup.value.reduce(function (a, b) {
    return Math.abs(a.day - targetDay) < Math.abs(b.day - targetDay) ? a : b;
  }, 0);
}
const lookupNetAvgPositive = () => {
  return lockedDaysLookup.value.reduce(function (a, b) {
    return (a.netAvg > 0) ? a : b;
  }, 0);
}
const lookupNetMaxTPositive = () => {
  return lockedDaysLookup.value.reduce(function (a, b) {
    return (a.netMaxT > 0) ? a : b;
  }, 0);
}
const lookupNetMaxAPositive = () => {
  return lockedDaysLookup.value.reduce(function (a, b) {
    return (a.netMaxA > 0) ? a : b;
  }, 0);
}
const generateProfitOutcome = () => {
  let targetDay = principal.value.duration
  netAvg.value = getNetAvg(targetDay)
  netMaxT.value = getNetMaxT(targetDay)
  netMaxA.value = getNetMaxA(targetDay)

  profitableAvg.value = getProfitableAvg(targetDay)
  profitableMaxT.value = getProfitableMaxT(targetDay)
  profitableMaxA.value = getProfitableMaxA(targetDay)

  netAPYAvg.value = getNetAPYAvg(targetDay)
  netAPYMaxT.value = getNetAPYMaxT(targetDay)
  netAPYMaxA.value = getNetAPYMaxA(targetDay)

  netAvgPositive.value = getNetAvgPositive(targetDay)
  netMaxTPositive.value = getNetMaxTPositive(targetDay)
  netMaxAPositive.value = getNetMaxAPositive(targetDay)
}

watch(principal, (newV, oldV) => {
  generateLockedDaysLookup()
  generateProfitOutcome()
  generateGraph()
}, {deep: true})

watch(fees, (newV, oldV) => {
  generateLockedDaysLookup()
  generateProfitOutcome()
  generateGraph()
}, {deep: true})

watch(network, (newV, oldV) => {
  getAdvPps()
  generateLockedDaysLookup()
  generateProfitOutcome()
  generateGraph()
})

watch(geniAdvPPS, (newV, oldV) => {
  generateLockedDaysLookup()
  generateProfitOutcome()
  generateGraph()
},)
const profitable = (condition) => {
  return condition ? "&#129321;" : "&#x1F62D;"
}
</script>


<template>
  <v-container v-if="principal.geniToMineUSD && principal.duration">

    <v-container>
      <v-card
        class="mx-auto bg-blue-grey-darken-3"
        width="850"
        prepend-icon="mdi-percent"
      >
        <template v-slot:title>
          Profitability
        </template>
        <v-card-text>
          <v-card-item>
            <v-card-subtitle> Adjust Avg PPS</v-card-subtitle>
            <v-slider
              v-model="geniAdvPPS"
              class="align-center"
              :max="geniAdvPPSMax"
              :min="geniAdvPPSMin"
              thumb-label
              step="0.01"
              show-ticks
            >
              <template v-slot:append>
                <v-text-field
                  v-model="geniAdvPPS"
                  type="number"
                  style="width: 90px"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-text-field>
              </template>
            </v-slider>
          </v-card-item>
          <v-card-item>
            <v-table height="250px" fixed-header>
              <thead>
              <tr>
                <th class="text-left"> Trend</th>
                <th class="text-left"> Profit</th>
                <th class="text-left"> APY %</th>
                <th class="text-left"> Net $</th>
                <th class="text-left"> In Profit on Day</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td> Expected Average</td>
                <td class="text-h4" v-html="profitable(profitableAvg)"></td>
                <td>{{ netAPYAvg }}%</td>
                <td>${{ netAvg }}</td>
                <td>{{ netAvgPositive }}</td>
              </tr>
              <tr>
                <td> Max Fees (Actual)</td>
                <td class="text-h4" v-html="profitable(profitableMaxA)"></td>
                <td>{{ netAPYMaxA }}%</td>
                <td>${{ netMaxA }}</td>
                <td>{{ netMaxAPositive }}</td>
              </tr>
              <tr>
                <td> Max Fees (Worst/Theory)</td>
                <td class="text-h4" v-html="profitable(profitableMaxT)"></td>
                <td>{{ netAPYMaxT }}%</td>
                <td>${{ netMaxT }}</td>
                <td>{{ netMaxTPositive }}</td>
              </tr>
              </tbody>
            </v-table>
          </v-card-item>
        </v-card-text>
      </v-card>
    </v-container>
    <v-container>
      <v-sheet
        class="mx-auto"
        width="850"
        height="400"
        prepend-icon="mdi-percent"
      >
        <Line :data="data" :options="options"/>
      </v-sheet>
    </v-container>
    <v-container>
      <v-card
        class="mx-auto bg-blue-grey-darken-3"
        width="850"
        prepend-icon="mdi-calculator"
      >
        <template v-slot:title>
          Profitability Matrix
        </template>
        <v-card-text>
          <v-table height="300px" fixed-header>
            <thead>
            <tr>
              <th class="text-left"> Day</th>
              <th class="text-left"> Gross</th>
              <th class="text-left"> Cost Avg</th>
              <th class="text-left"> Cost Max A</th>
              <th class="text-left"> Cost Max T</th>
              <th class="text-left"> Net Avg</th>
              <th class="text-left"> Net Max A</th>
              <th class="text-left"> Net Max T</th>
              <th class="text-left"> Profit Avg</th>
              <th class="text-left"> Profit Max A</th>
              <th class="text-left"> Profit Max T</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="item in lockedDaysLookup"
              :key="item.day"
            >
              <td>{{ item.day }}</td>
              <td>{{ item.gross.toLocaleString() }}</td>
              <td>{{ item.costAvg.toLocaleString() }}</td>
              <td>{{ item.costMaxA.toLocaleString() }}</td>
              <td>{{ item.costMaxT.toLocaleString() }}</td>
              <td>{{ item.netAvg.toLocaleString() }}</td>
              <td>{{ item.netMaxA.toLocaleString() }}</td>
              <td>{{ item.netMaxT.toLocaleString() }}</td>
              <td>{{ item.profitAvg.toLocaleString() }}</td>
              <td>{{ item.profitMaxA.toLocaleString() }}</td>
              <td>{{ item.profitMaxT.toLocaleString() }}</td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </v-container>
</template>

<style scoped>
.green {
  color: green;
}

.rose {
  color: indianred;
}
</style>

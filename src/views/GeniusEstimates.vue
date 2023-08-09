<script setup>

import CalcMiningSharesEstimates from "@/components/CalcMiningSharesEstimates.vue";
import NetworkSelector from "@/components/NetworkSelector.vue";
import CalcNetFeeEstimates from "@/components/CalcNetFeeEstimates.vue";
import CalcProfitCurve from "@/components/CalcProfitCurve.vue";
import Alerter from "@/components/Alerter.vue";
</script>
<template>
  <v-container fluid>
    <NetworkSelector/>
    <CalcNetFeeEstimates/>
    <CalcMiningSharesEstimates/>
    <CalcProfitCurve/>
    <Alerter/>
  </v-container>
</template>

<style scoped>
</style>

<script setup>
const steps = [
  {
    title: 'Mining Reward Shares',
    message: `Estimate Reward IQ Shares based on your principal and duration of a miner `,
    color: 'deep-purple-lighten-1',
    to: "GeniusEstimates",
    start: true,
  },
  {
    title: 'Accurate Network Fees',
    message: `Get real-time network fee analysis for starting and ending a miner. Don't get caught unprepared and maximize your mining rewards by using predictive fee analysis.`,
    color: 'orange-lighten-1',
  },
  {
    title: 'Profit Curves',
    message: `Know when your future miner becomes profitable today, before you enter it`,
    color: 'green-lighten-1',
  },
]
</script>
<template>
  <v-container>
    <v-row justify="space-around">
      <v-card width="850">
        <v-card-title> Genius Mining Calculator</v-card-title>
        <v-card-text>
          <div class="font-weight-bold ms-1 mb-2">
            Start Earning Today
          </div>

          <v-timeline density="compact" align="start">
            <v-timeline-item
              v-for="step in steps"
              :key="step.time"
              :dot-color="step.color"
              size="medium"
            >
              <div class="mb-4">
                <div class="font-weight-normal">
                  <strong>{{ step.title }}</strong>
                </div>
                <div>{{ step.message }}</div>
                <v-btn v-if="step.start" append-icon="mdi-chevron-right" variant="outlined" color="orange" :to="{ name: step.to }"> Start! </v-btn>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>


<style scoped>
</style>

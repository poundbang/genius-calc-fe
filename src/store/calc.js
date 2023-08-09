// Utilities
import {defineStore} from 'pinia'

const shareRateMin = 2618
const defaultState =
  {
    network: '',
    prices: {
      native: 0,
      geni: 0,
    },
    principal: {
      geniToMine: 0,
      geniToMineUSD: 0,
      shareRate: shareRateMin,
      duration: 0,
    },
    rewards: {
      shares: 0,
      advPps: 0,
    },
    fees: {
      gasCost: 0,
      networkStartGasHistoryAvg: 0,
      networkEndGasHistoryAvg: 0,
      networkEndGasHistoryMaxA: 0,
      networkEndGasHistoryMaxT: 0,
      startCostAvg: 0,
      startCostMaxA: 0,
      startCostMaxT: 0,
      endCostAvg: 0,
      endCostMaxA: 0,
      endCostMaxT: 0,
      lockedCostAvg: 0,
      lockedCostMaxA: 0,
      lockedCostMaxT: 0
    }
  }
export const useCalcStore = defineStore('calculator', {
  state: () => (
    { ...defaultState }
  ),
  getters: {
    getRewardShares(state) {
      return state.rewards.shares
    },
  },
  actions: {
    setRewardShares(shareCount) {
      this.rewards.shares = shareCount
    },
    reset() {
      Object.assign(this, defaultState);
    }
  },

})

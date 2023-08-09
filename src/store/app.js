// Utilities
import {defineStore} from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => (
    {
      navDrawer: true,
      notifier: {
        type: null,
        value: ""
      },
      alerter: {
        time: null,
        facility: "Application",
        type: "info",
        msg: ""
      }
  }),
  getters: {
    getAlerter(state) {
      return state.alerter
    }
  },
  actions: {
    setAlert({facility, type, msg}) {
      this.alerter = {time: Date.now(), facility, type, msg}
    },
  },
})

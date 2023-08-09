import {useAppStore} from "@/store/app";

const appStore = useAppStore()
function newAlert({logOnly = false,facility, type, msg}){
  console.warn(`Alert: ${type} | ${facility} | ${msg}`)
  if (!logOnly)
    appStore.setAlert({facility, type, msg})
}

export {
  newAlert
}

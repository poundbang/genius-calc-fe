// fetch.js
import {isRef, ref, unref, watchEffect} from 'vue'

export function useNetworkGas(url) {
  const data = ref(null)
  const error = ref(null)

  const opts = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET"
  }

  async function doFetch() {
    // reset state before fetching..
    data.value = null
    error.value = null

    // resolve the url value synchronously so it's tracked as a
    // dependency by watchEffect()
    const urlValue = unref(url)

    try {
      // unref() will return the ref value if it's a ref
      // otherwise the value will be returned as-is
      const res = await fetch(urlValue, opts)
      data.value = await res.json()
    } catch (e) {
      error.value = e
    }
  }

  if (isRef(url)) {
    // setup reactive re-fetch if input URL is a ref
    watchEffect(doFetch)
  } else {
    // otherwise, just fetch once
    // and avoid the overhead of a watcher
    doFetch()
  }

  return {data, error}
}


async function doFetch2(url, opts) {

  try {
    return  await fetch(url, opts)
      .then(res => res.json())
  } catch (e) {
    console.log(e)
    return e
  }
}


export function useNetworkHistoryGas(url) {

  const opts = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET"
  }
  return doFetch2(url, opts)
}

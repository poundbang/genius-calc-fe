const apiOpts = {
  headers: {
    "Content-Type": "application/json",
  },
  method: "GET"
}

const checkFetch = function(response) {
  if (!response.ok) {
    throw new Error(response.statusText + ' - ' + response.url);
  }
  return response;
};

const apiDriver = async function(url, opts = apiOpts) {
  try {
    let resp = await fetch(url, opts);
    resp = await checkFetch(resp);
    return await resp.json();
  } catch(e) {
    console.warn(e);
  }
};

export  {
  apiOpts,
  apiDriver
}

const resKey = [ 'headers', 'redirected', 'status', 'type', 'url' ]
const getError = r => resKey.reduce((e, k) => (e[k] = r[k], e), Error(r.statusText))

const useBody = method => r => r.ok ? r[method]() : Promise.reject(getError(r))
const toText = useBody('text')
const toJSON = useBody('json')
const parseHTML = str => (new DOMParser()).parseFromString(str, "text/html")
const get = module.exports = (url, options) => fetch(url, options).then(toText)
get.json = (url, options) => fetch(url, options).then(toJSON)
get.html = (url, options) => get(`https://crossorigin.me/${url}`, options)
  .then(parseHTML)
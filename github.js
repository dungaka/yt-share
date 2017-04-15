const get = require('./get')
const API = 'https://api.github.com'
const toBase64 = require('./base64')
const note = require('./note')
const headers = {
  Accept: 'application/vnd.github.v3+json',
  Authorization: window.localStorage.__ID__,
  'Content-Type': 'application/x-www-form-urlencoded',
}

const login = user => {
  if (!user || !(user.login || user.token)) {
    if (!headers.Authorization) {
      return Promise.reject(Error('Missing Authorization Credentials'))
    }
  } else {
    headers.Authorization = user.token
      ? 'token '+ user.token
      : 'Basic '+ toBase64(user.login +':'+ user.password)
  }

  window.localStorage.__ID__ = headers.Authorization
  return get.json(`${API}/user`, { headers })
}

const fork = repo => get.json(`${API}/repos/${repo}/forks`, { method: 'POST', headers })

window.w = _ => (console.log(_), _)

const save = (hash, repo, content) => get.json(`${API}/repos/${repo}/contents/${hash}.html`, {
    headers,
    method: 'PUT',
    body: JSON.stringify({
      path: hash + '.html',
      message: 'saving preview for youtube video '+ hash,
      content: w(toBase64(w(content))),
      branch: 'gh-pages',
    }),
  })

module.exports = {
  save,
  checkPage: (repo, hash) =>
    get(`https://raw.githubusercontent.com/${repo}/gh-pages/${hash}.html`),
  getRepo: form => login(form)
    .then(() => fork('kigiri/yt-share'))
    .then(res => res.full_name),
}
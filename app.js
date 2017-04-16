const h = require('izi/vanilla-h').proxy
const delay = require('./delay')
const delay500 = delay(500)
const buildPage = require('./build-page')
const dataBind = require('./data-bind')
const github = require('./github')
const submit = require('./submit')
const note = require('./note')
const get = require('./get')

const loader = h.div({
  style: {
    height: '150px',
    height: '250px',
    opacity: 0,
    transition: 'opacity 2s',
    overflow: 'hidden',
  }
}, h['.loader']('Loading...'))

const copy = () => {
  try { return document.execCommand("copy") }
  catch (err) { return false }
}

const input = (name, type = 'text') => h.div(h.label([
  h.div(name),
  h.input({ type, name, required: true }),
]))

const getHash = str => /youtube/.test(str)
  ? (new URLSearchParams(new URL(str).search)).get('v')
  : str

// cleanup the dom to replace the content on state updates
const updateDom = content => {
  loader.remove()
  Array.from(document.body.getElementsByTagName('form'))
    .forEach(el => el.remove())
  document.body.appendChild(content)
  content.getElementsByTagName('input')[0].focus()
}

// handle onsubmit for pushing the file to github
const handleSave = e => {
  e.preventDefault()
  const hash = getHash(e.target.elements.video.value)

  submit.disable()
  note.set(`downloading ${hash} info from youtube`)
  github.checkPage(repo, hash)
    .catch(err => err.status !== 404
      ? Promise.reject(err)
      : buildPage(hash).then(page => {
          note.set(`saving page to ${repo}`)
          return github.save(hash, repo, page)
        }))
    .then(() => {
      const [ user, name ] = repo.split('/')
      const link = input('link')
      const inputElem = link.getElementsByTagName('input')[0]
      inputElem.disabled = true
      const href = inputElem.value = `https://${user}.github.io/${name}/${hash}`
      setTimeout(() => inputElem.select(), 150)

      // this retry to load the page until it stop giving 404
      // only then we know for sure that github rendered it properly
      retry(n => delay500().then(() => get(`${href}?${n}`)))

      lookupLink().then(() => {
        link.appendChild(h.a({ href }, href))
        note.set(`your link is ready`)
      })

      return updateDom(h.form({
        onsubmit: e => {
          e.preventDefault()
          inputElem.select()
          if (copy()) {
            note.set(`${inputElem.value} copied successfully !`)
          } else {
            note.error(`Unable to copy`)
            submit.disable()
          }
        }
      }, [
        h.h3('like share subscribe'),
        link,
        note.set('Waiting for github to update...'),
        submit.set('copy'),
      ]))
    }, note.error)
    .then(submit.enable)
}

const setBackground = value =>
  document.firstElementChild.style.backgroundImage = value

const loadUser = repo => {
  const video = input('video')
  const videoInput = video.getElementsByTagName('input')[0]

  // this allow to react to changes on the video input
  dataBind(() => videoInput.value, value => {
    hash = getHash(videoInput.value)
    if (hash.length !== 11) {
      submit.disable()
      return setBackground('')
    }
    submit.enable()
    setBackground(`url('https://i.ytimg.com/vi/${hash}/maxresdefault.jpg')`)
  })

  return h.form({ onsubmit: handleSave }, [
    h.h3('Youtube video'),
    input('video'),
    note.set(`Authorized to push on ${repo}`),
    video,
    submit.set('save'),
  ])
}

// handle onsubmit for authorizing github access
const handleAuthorize = e => {
  e.preventDefault()
  const { user: login, password } = e.target.elements
  submit.disable()
  github.getRepo({ login: login.value, password: password.value })
    .then(loadUser)
    .then(updateDom)
    .catch(note.error)
    .then(submit.enable)
}

// start up the app by trying to recover the repo
github.getRepo()
  .then(loadUser, () => h.form({ onsubmit: handleAuthorize }, [
    h.h3('GitHub Credentials'),
    input('user'),
    input('password', 'password'),
    note.set('this website is only client side so your password isn\'t stored on any server'),
    submit.set('authorize'),
  ]))
  .then(updateDom)

// delay showing the loading to avoid flashing for short loads time
setTimeout(() => loader.style.opacity = 1, 150)

// this is for hot reload with 2pac
window.__app__ || document.body.appendChild(window.__app__ = loader)

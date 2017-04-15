const h = require('izi/vanilla-h').proxy
const github = require('./github')
const buildPage = require('./build-page')
const submit = require('./submit')
const note = require('./note')
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

setInterval(() => {
  const form = document.getElementsByTagName('form')[0]
  if (!form || !form.elements.video) return
  submit.disable()
  const hash = getHash(form.elements.video.value)
  if (hash.length !== 11) {
    document.firstElementChild.style.backgroundImage = ''
    return note.error('invalid video hash')
  }
  submit.enable()
  note.set('hash seems ok !')
  document.firstElementChild.style.backgroundImage =
    `url('https://i.ytimg.com/vi/${hash}/maxresdefault.jpg')`
}, 100)

const loadUser = repo => h.form({
  onsubmit: e => {
    e.preventDefault()
    const hash = getHash(e.target.elements.video.value)

    submit.disable()
    note.set(`downloading ${hash} info from youtube`)
    github.checkPage(repo, hash)
      .catch(err => w(err).status !== 404
        ? Promise.reject(err)
        : buildPage(hash).then(page => {
            note.set(`saving page to ${repo}`)
            return github.save(hash, repo, page)
          }))
      .then(() => {
        const [ user, name ] = repo.split('/')
        const link = input('link')
        const inputElem = link.getElementsByTagName('input')[0]
        const href = inputElem.value = `https://${user}.github.io/${name}/${hash}`
        setTimeout(() => inputElem.select(), 150)
        return showDom(h.form({
          onsubmit: e => {
            e.preventDefault()
            inputElem.select()
            if (copy()) {
              note.set(`${inputElem.value} copied successfully !`)
              submit.set('open link')
              e.target.onsubmit = e => {
                e.preventDefault()
                window.location = href
              }
            } else {
              note.error(`Unable to copy`)
              submit.disable()
            }
          }
        }, [
          h.h3('Your link is ready !'),
          link,
          note,
          submit.set('copy'),
        ]))
      }, note.error)
      .then(submit.enable)
  }
}, [
  h.h3('Youtube video'),
  input('video'),
  note.set(`Authorized to push on ${repo}`),
  submit.set('save'),
])

const showDom = content => {
  loader.remove()
  Array.from(document.body.getElementsByTagName('form'))
    .forEach(el => el.remove())
  document.body.appendChild(content)
  content.getElementsByTagName('input')[0].focus()
}

github.getRepo()
  .then(loadUser, () => h.form({
    method: 'post',
    onsubmit: e => {
      e.preventDefault()
      const { user: login, password } = e.target.elements
      submit.disable()
      github.getRepo({ login: login.value, password: password.value })
        .then(loadUser)
        .then(showDom)
        .catch(note.error)
        .then(submit.enable)
    },
  }, [
    h.h3('GitHub Credentials'),
    input('user'),
    input('password', 'password'),
    note.set('this website is only client side so your password isn\'t stored on any server'),
    submit.set('authorize'),
  ]))
  .then(showDom)

window.__app__ || document.body.appendChild(window.__app__ = loader)

setTimeout(() => loader.style.opacity = 1, 150)

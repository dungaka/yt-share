const h = require('izi/vanilla-h').proxy
const content = h.span()
const elem = h['.note']({
  style: {
    fontSize: '12px',
    textAlign: 'center',
    minHeight: '4em',
  }
}, content)

const set = color => text => {
  elem.style.color = color
  content.textContent = text
  return elem
}

elem.set = set('blue')
elem.error = set('red')

module.exports = elem

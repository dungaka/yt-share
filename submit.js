const h = require('izi/vanilla-h').proxy
const input = h.input({ type: 'submit', value: 'submit' })
const submit = h['#submit']({
  style: { textAlign: 'right' },
}, input)

submit.disable = () => (input.disabled = true, submit)
submit.enable = () => (input.disabled = false, submit)
submit.set = value => (input.value = value, submit)

module.exports = submit
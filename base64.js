// adapted from https://gist.github.com/Nijikokun/5192472

const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
window.b64 = module.exports = str => {
  const buf = []
  let a, b, c, d, e, f, g
  let output = ''
  let i = -1
  let charCode

  str = str.replace(/\r\n/g, '\n')

  while (++i < str.length) {
    charCode = str.charCodeAt(i)
    if (charCode < 128) {
      buf.push(charCode)
    } else if ((charCode > 127) && (charCode < 2048)) {
      buf.push((charCode >> 6) | 192)
      buf.push((charCode & 63) | 128)
    } else {
      buf.push((charCode >> 12) | 224)
      buf.push(((charCode >> 6) & 63) | 128)
      buf.push((charCode & 63) | 128)
    }
  }

  i = 0

  while (i < buf.length) {
    a = buf[i++]
    b = buf[i++]
    c = buf[i++]
    d = a >> 2
    e = ((a & 3) << 4) | (b >> 4)
    f = ((b & 15) << 2) | (c >> 6)
    g = c & 63

    if (isNaN(b)) { f = g = 64 }
    else if (isNaN(c)) { g = 64 }
    output += map[d] + map[e] + map[f] + map[g]
  }

  return output
}
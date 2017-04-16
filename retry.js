// retry a promise until it's stop failing
// calling it with a number indicating the count of retries

module.exports = fn => (function recursiveTry(n) {
  return fn(n).catch(() => recursiveTry(n + 1))
})(0)

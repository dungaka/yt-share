module.exports = (getter, trigger, interval=150, value) => {
  const intervalId = setInterval(() => {
    const newValue = getter()
    (newValue === value) || trigger(value = newValue)
  }, interval)
  return () => clearInterval(intervalId)
}
function getUnixToday() {
  return Math.floor(new Date().getTime() / 1000 / 3600 / 24)
}

module.exports = {
  getUnixToday
}

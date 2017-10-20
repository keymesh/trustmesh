const { configure } = require('./web3')
const Trustbase = require('./Trustbase')
const PreKeyStore = require('./PreKeyStore')
const Messages = require('./Messages')

module.exports = {
  configure,
  Trustbase,
  PreKeyStore,
  Messages
}

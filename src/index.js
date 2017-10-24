const {
  configure,
  getWeb3
} = require('./web3')
const Trustbase = require('./Trustbase')
const PreKeyStore = require('./PreKeyStore')
const Messages = require('./Messages')

module.exports = {
  getWeb3,
  configure,
  Trustbase,
  PreKeyStore,
  Messages
}

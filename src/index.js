const {
  initialize,
  getWeb3
} = require('./web3')
const Trustbase = require('./Trustbase')
const PreKeyStore = require('./PreKeyStore')
const Messages = require('./Messages')
const TrustbaseError = require('./TrustbaseError')

module.exports = {
  getWeb3,
  initialize,
  Trustbase,
  PreKeyStore,
  Messages,
  TrustbaseError
}

const {
  initialize,
  getWeb3,
  sha3
} = require('./web3')
const Identities = require('./Identities')
const Messages = require('./Messages')
const TrustbaseError = require('./TrustbaseError')

module.exports = {
  getWeb3,
  sha3,
  initialize,
  Identities,
  Messages,
  TrustbaseError
}

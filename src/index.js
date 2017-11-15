const {
  initialize,
  getWeb3,
  getUsernameHash
} = require('./web3')
const Identities = require('./Identities')
const PreKeys = require('./PreKeys')
const Messages = require('./Messages')
const TrustbaseError = require('./TrustbaseError')

module.exports = {
  getWeb3,
  getUsernameHash,
  initialize,
  Identities,
  PreKeys,
  Messages,
  TrustbaseError
}

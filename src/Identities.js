const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/Identities.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class Identities {
  constructor(options = {}) {
    const contract = getContractInstance(
      contractName,
      abi,
      Object.assign({ networks }, options)
    )
    this.web3 = getWeb3()
    this.contract = contract
  }

  register(usernameOrUsernameHash, identityPublicKey, options = {}) {
    const {
      isHash
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.register(usernameHash, identityPublicKey).send(Object.assign({
      from: this.web3.eth.defaultAccount,
      gas: 100000,
      gasPrice: 20000000000 // 20 Gwei
    }, options))
  }

  isOwner(usernameOrUsernameHash, accountAddress, options = {}) {
    const {
      isHash
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.isOwner(usernameHash, accountAddress).call(options)
  }

  getIdentity(usernameOrUsernameHash, options = {}) {
    const {
      isHash
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.getIdentity(usernameHash).call(options)
  }
}

module.exports = Identities

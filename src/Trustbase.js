const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/Trustbase.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class Trustbase {
  constructor(options = {}) {
    const contract = getContractInstance(
      contractName,
      abi,
      {
        networks,
        ...options
      }
    )
    this.web3 = getWeb3()
    this.contract = contract
  }

  register(usernameOrUsernameHash, identityPublicKey, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.register(usernameHash, identityPublicKey).send({
      gas: 100000,
      gasPrice: 20000000000, // 20 Gwei
      ...otherOptions
    })
  }

  isOwner(accountAddress, usernameOrUsernameHash, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.isOwner(accountAddress, usernameHash).call(otherOptions)
  }

  getIdentity(usernameOrUsernameHash, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.getIdentity(usernameHash).call(otherOptions)
  }
}

module.exports = Trustbase

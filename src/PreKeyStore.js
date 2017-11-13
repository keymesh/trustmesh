const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/PreKeyStore.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

const {
  getUnixToday
} = require('./utils')

class PreKeyStore {
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

  uploadPrekeys(usernameOrUsernameHash, prekeyPublicKeys, options = {}) {
    const {
      isHash,
      interval = 1,
      fromUnixDay = getUnixToday(),
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.addPrekeys(
      usernameHash,
      prekeyPublicKeys,
      fromUnixDay,
      interval
    ).send({
      gas: 4712380,
      gasPrice: 20000000000, // 20 Gwei for test
      ...otherOptions
    })
  }

  getPrekey(usernameOrUsernameHash, unixDay, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.getPrekey(usernameHash, unixDay).call(otherOptions)
  }

  getMetaData(usernameOrUsernameHash, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.getMetaData(usernameHash).call(otherOptions)
  }
}

module.exports = PreKeyStore

const {
  getUnixToday
} = require('./utils')

const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/PreKeyStore.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class PreKeyStore {
  static async new(options = {}) {
    const contract = await getContractInstance(
      contractName,
      abi,
      {
        networks,
        ...options
      }
    )
    return new PreKeyStore(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  uploadPrekeys(name, prekeysPublicKeys, options = {}) {
    const {
      isHash,
      interval = 1,
      fromUnixDay = getUnixToday(),
      ...otherOptions
    } = options
    const nameHash = isHash ? name : this.web3.utils.sha3(name)

    return this.contract.methods.addPrekeys(
      nameHash,
      prekeysPublicKeys,
      fromUnixDay,
      interval
    ).send({
      gas: 4712380,
      gasPrice: 20000000000, // 20 Gwei for test
      ...otherOptions
    })
  }

  getPrekey(name, unixDay, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const nameHash = isHash ? name : this.web3.utils.sha3(name)

    return this.contract.methods.getPrekey(nameHash, unixDay).call(otherOptions)
  }

  getMetaData(name, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const nameHash = isHash ? name : this.web3.utils.sha3(name)

    return this.contract.methods.getMetaData(nameHash).call(otherOptions)
  }
}

module.exports = PreKeyStore

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
      Object.assign({ networks }, options)
    )
    return new PreKeyStore(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  uploadPrekeys(name, prekeysPublicKeys, options = {}) {
    const nameHash = this.web3.utils.sha3(name)
    const {
      interval = 1,
      fromUnixDay = getUnixToday(),
      ...otherOptions
    } = options

    return this.contract.methods.addPrekeys(
      nameHash,
      prekeysPublicKeys,
      fromUnixDay,
      interval
    ).send({
      gas: 4712380,
      ...otherOptions
    })
  }

  getPrekey(name, unixDay, options) {
    const nameHash = this.web3.utils.sha3(name)

    return this.contract.methods.getPrekey(nameHash, unixDay).call(options)
  }

  getMetaData(name, options) {
    const nameHash = this.web3.utils.sha3(name)

    return this.contract.methods.getMetaData(nameHash).call(options)
  }
}

module.exports = PreKeyStore

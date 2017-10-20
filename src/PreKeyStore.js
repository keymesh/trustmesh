const {
  getUnixToday
} = require('./utils')

const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/PreKeyStore')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class PreKeyStore {
  static async new(options = { networks }) {
    const contract = await getContractInstance(contractName, abi, options)
    return new PreKeyStore(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  async uploadPrekeys(name, prekeysPublicKeys, options = {}) {
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

  async getPrekey(name, unixDay, options) {
    const nameHash = this.web3.utils.sha3(name)

    return this.contract.methods.getPrekey(nameHash, unixDay).call(options)
  }

  async getMetaData(name, options) {
    const nameHash = this.web3.utils.sha3(name)

    return this.contract.methods.getMetaData(nameHash).call(options)
  }
}

module.exports = PreKeyStore

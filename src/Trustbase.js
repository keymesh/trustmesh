const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/Trustbase')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class Trustbase {
  static async new(options = { networks }) {
    const contract = await getContractInstance(contractName, abi, options)
    return new Trustbase(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  async register(name, identityKey, options) {
    const nameHash = this.web3.utils.sha3(name)

    return this.contract.methods.register(nameHash, identityKey).send({
      gas: 100000,
      ...options
    })
  }

  async getIdentity(name, options) {
    const nameHash = this.web3.utils.sha3(name)

    return this.contract.methods.getIdentity(nameHash).call(options)
  }
}

module.exports = Trustbase

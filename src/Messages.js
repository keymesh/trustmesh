const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/Messages')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class Messages {
  static async new(options = { networks }) {
    const contract = await getContractInstance(contractName, abi, options)
    return new Messages(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  async publish(message, options) {
    return this.contract.methods.publish(message).send({
      gas: 100000,
      ...options
    })
  }
}

module.exports = Messages

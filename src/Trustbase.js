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
  static async new(options = {}) {
    const contract = await getContractInstance(
      contractName,
      abi,
      {
        networks,
        ...options
      }
    )
    return new Trustbase(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  register(name, identityKey, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const nameHash = isHash ? name : this.web3.utils.sha3(name)

    return this.contract.methods.register(nameHash, identityKey).send({
      gas: 100000,
      gasPrice: 20000000000, // 20 Gwei for test
      ...otherOptions
    })
  }

  isOwner(accountAddress, name, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const nameHash = isHash ? name : this.web3.utils.sha3(name)

    return this.contract.methods.isOwner(accountAddress, nameHash).call(otherOptions)
  }

  getIdentity(name, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const nameHash = isHash ? name : this.web3.utils.sha3(name)

    return this.contract.methods.getIdentity(nameHash).call(otherOptions)
  }
}

module.exports = Trustbase

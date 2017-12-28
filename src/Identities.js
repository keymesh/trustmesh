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

  register(identityPublicKey, options = {}) {
    return this.contract.methods.register(identityPublicKey).send(Object.assign({
      from: this.web3.eth.defaultAccount,
      gas: 100000,
      gasPrice: 20000000000 // 20 Gwei
    }, options))
  }

  getIdentity(userAddress, options = {}) {
    return this.contract.methods.getIdentity(userAddress).call(options)
  }
}

module.exports = Identities

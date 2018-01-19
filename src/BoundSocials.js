const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/BoundSocials.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class BoundSocials {
  constructor(options = {}) {
    const contract = getContractInstance(
      contractName,
      abi,
      Object.assign({ networks }, options)
    )
    this.web3 = getWeb3()
    this.contract = contract
  }

  bind(userAddress, signedBoundSocials, options = {}) {
    return this.contract.methods.bind(userAddress, signedBoundSocials).send(Object.assign({
      from: this.web3.eth.defaultAccount,
      gas: 200000,
      gasPrice: 20000000000 // 20 Gwei
    }, options))
  }

  async getBindEvents(options = {}) {
    const lastBlock = await this.web3.eth.getBlockNumber()

    const events = await this.contract.getPastEvents('Bind', Object.assign({
      toBlock: lastBlock
    }, options))

    const bindEvents = events
      .map((event) => {
        const {
          blockNumber,
          returnValues: {
            userAddress,
            signedBoundSocials
          }
        } = event

        // pending event
        if (blockNumber === null) {
          return null
        }

        return {
          userAddress,
          signedBoundSocials
        }
      })
      .filter(m => m !== null)

    return {
      lastBlock,
      bindEvents
    }
  }
}

module.exports = BoundSocials

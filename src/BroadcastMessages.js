const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/BroadcastMessages.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class BroadcastMessages {
  constructor(options = {}) {
    const contract = getContractInstance(
      contractName,
      abi,
      Object.assign({ networks }, options)
    )
    this.web3 = getWeb3()
    this.contract = contract
  }

  publish(signedMessage, userAddress, options = {}) {
    return this.contract.methods.publish(signedMessage, userAddress).send(Object.assign({
      from: this.web3.eth.defaultAccount,
      gas: 200000,
      gasPrice: 20000000000 // 20 Gwei
    }, options))
  }

  async getBroadcastMessages(options = {}) {
    const lastBlock = await this.web3.eth.getBlockNumber()

    const publishEvents = await this.contract.getPastEvents('Publish', Object.assign({
      toBlock: lastBlock
    }, options))

    const broadcastMessages = publishEvents
      .map((event) => {
        const {
          blockNumber,
          returnValues: {
            signedMessage,
            userAddress,
            timestamp
          }
        } = event

        // pending event
        if (blockNumber === null) {
          return null
        }

        return {
          signedMessage,
          userAddress,
          timestamp
        }
      })
      .filter(m => m !== null)

    return {
      lastBlock,
      broadcastMessages
    }
  }
}

module.exports = BroadcastMessages

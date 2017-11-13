const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/Messages.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class Messages {
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

  publish(message, options = {}) {
    return this.contract.methods.publish(message).send({
      gas: 200000,
      gasPrice: 20000000000, // 20 Gwei for test
      ...options
    })
  }

  async getMessages(options = {}) {
    const lastBlock = await this.web3.eth.getBlockNumber()

    const publishEvents = await this.contract.getPastEvents('Publish', {
      toBlock: lastBlock,
      ...options
    })

    const messages = publishEvents
      .map((event) => {
        const {
          blockNumber,
          returnValues: {
            message,
            timestamp
          }
        } = event

        // pending event
        if (!blockNumber) {
          return null
        }

        return {
          message,
          timestamp
        }
      })
      .filter(m => m !== null)

    return {
      lastBlock,
      messages
    }
  }
}

module.exports = Messages

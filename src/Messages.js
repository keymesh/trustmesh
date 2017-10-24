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
  static async new(options = {}) {
    const contract = await getContractInstance(
      contractName,
      abi,
      Object.assign({ networks }, options)
    )
    return new Messages(contract)
  }

  constructor(contract) {
    // TODO: prevent calling constructor directly
    this.web3 = getWeb3()
    this.contract = contract
  }

  publish(messageType, username, message, options) {
    const messageTypeHash = this.web3.utils.sha3(messageType)
    const usernameHash = this.web3.utils.sha3(username)
    return this.contract.methods.publish(messageTypeHash, usernameHash, message).send({
      gas: 100000,
      ...options
    })
  }

  async getMessages(messageType, options) {
    const messageTypeHash = this.web3.utils.sha3(messageType)
    const publishEvents = await this.contract.getPastEvents('Publish', Object.assign({}, {
      filter: { messageTypeHash },
      fromBlock: 0,
      toBlock: 'latest'
    }, options))

    let lastBlock = 0
    const messages = publishEvents.map((event) => {
      const {
        blockNumber,
        returnValues: {
          message,
          timestamp,
          senderUserHash
        }
      } = event

      if (blockNumber > lastBlock) {
        lastBlock = blockNumber
      }

      return {
        message,
        timestamp,
        senderUserHash
      }
    })

    return {
      lastBlock,
      messages
    }
  }
}

module.exports = Messages

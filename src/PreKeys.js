const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/PreKeys.json')

const {
  getContractInstance,
  getWeb3
} = require('./web3')

class PreKeys {
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

  upload(usernameOrUsernameHash, preKeys, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    return this.contract.methods.upload(
      usernameHash,
      preKeys
    ).send({
      gas: 2000000,
      gasPrice: 20000000000, // 20 Gwei
      ...otherOptions
    })
  }

  async getPreKeys(usernameOrUsernameHash, options = {}) {
    const {
      isHash,
      ...otherOptions
    } = options
    const usernameHash = isHash
      ? usernameOrUsernameHash
      : this.web3.utils.sha3(usernameOrUsernameHash)

    const uploadEvents = await this.contract.getPastEvents('Upload', {
      filter: { usernameHash },
      fromBlock: 0,
      toBlock: 'latest',
      ...otherOptions
    })

    let latestPreKeys = ''
    let latestUpdateTime = 0
    for (let i = 0; i < uploadEvents.length; i += 1) {
      const event = uploadEvents[i]
      const {
        blockNumber,
        returnValues: {
          preKeys,
          updateAt
        }
      } = event

      if (blockNumber !== null && updateAt > latestUpdateTime) {
        latestPreKeys = preKeys
        latestUpdateTime = updateAt
      }
    }

    return latestPreKeys
  }
}

module.exports = PreKeys

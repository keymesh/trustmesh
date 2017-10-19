const Web3 = require('web3')

const HDWalletProvider = require('./HDWalletProvider')
const isDev = process.env.NODE_ENV === 'development'


async function setup(options = {}) {
  let provider
  if (options.provider) {
    provider = (
      options.mnemonic
        ? new HDWalletProvider(options.mnemonic, options.provider, options.index)
        : options.provider
    )
  }

  const web3 = new Web3(isDev ? 'http://localhost:8545' : provider)

  let from = options.from
  let accounts = [from]
  if (!from) {
    web3.eth.extend({
      methods: [{
        name: 'getAccounts',
        call: 'eth_accounts'
      }]
    })

    accounts = await web3.eth.getAccounts()

    if (accounts.length === 0) {
      throw new Error('No account found')
    }

    from = accounts[0]
  }

  async function getContractInstance(contractName, abi, networks = {}) {
    let address = options.address
    if (!address) {
      const currentNetworkId = await web3.eth.net.getId()
      const network = networks[currentNetworkId]
      if (!network) {
        throw new Error(`${contractName} has not been deployed to detected network (network/artifact mismatch)`)
      }

      address = network.address
      if (!network.address) {
        throw new Error(`${contractName} has not been deployed to detected network (${currentNetworkId})`)
      }
    }
    if (!web3.utils.isAddress(address)) {
      throw new Error('Invalid contract address')
    }

    const code = await web3.eth.getCode(address)
    if (!code || code.replace('0x', '').replace(/0/g, '') === '') {
      throw new Error(`Cannot create instance of ${contractName}; no code at address ${address}`)
    }

    return new web3.eth.Contract(abi, address, {
      from
    })
  }

  return {
    web3,
    accounts,
    getContractInstance
  }
}

module.exports = setup

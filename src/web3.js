const Web3 = require('web3')

const HDWalletProvider = require('./HDWalletProvider')
const isDev = process.env.NODE_ENV === 'development'

let web3
let currentNetworkId

function getWeb3() {
  if (web3 === undefined) {
    throw new Error('You must run web3 configuration first!')
  }
  return web3
}

async function configure(options = {}) {
  if (web3 !== undefined) {
    console.warn('web3 configuration should not call twice!')
    return
  }

  let provider
  if (options.provider) {
    provider = (
      options.mnemonic
        ? new HDWalletProvider(options.mnemonic, options.provider, options.index)
        : options.provider
    )
  }

  web3 = new Web3(isDev ? 'http://localhost:8545' : provider)

  let defaultAccount = options.defaultAccount
  let accounts = [defaultAccount]
  if (!defaultAccount) {
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

    defaultAccount = accounts[0]
  }

  web3.eth.defaultAccount = defaultAccount
  currentNetworkId = await web3.eth.net.getId()
}

async function getContractInstance(contractName, abi, options) {
  if (web3 === undefined) {
    throw new Error('You must run web3 configuration first!')
  }

  const {
    networks = {},
    address = getAddressFromNetworks() // eslint-disable-line
  } = options

  function getAddressFromNetworks() {
    const network = networks[currentNetworkId]
    if (!network) {
      throw new Error(`${contractName} has not been deployed to detected network (network/artifact mismatch)`)
    }

    if (!network.address) {
      throw new Error(`${contractName} has not been deployed to detected network (${currentNetworkId})`)
    }

    return network.address
  }

  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid contract address')
  }

  const code = await web3.eth.getCode(address)
  if (!code || code.replace('0x', '').replace(/0/g, '') === '') {
    throw new Error(`Cannot create instance of ${contractName}; no code at address ${address}`)
  }

  return new web3.eth.Contract(abi, address, {
    from: web3.eth.defaultAccount
  })
}

module.exports = {
  getWeb3,
  configure,
  getContractInstance
}

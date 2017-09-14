const yargs = require('yargs')
const fs = require('fs')

const {
  network
} = yargs.argv
let provider
let address

if (network === 'rinkeby' || network === 'mainnet') {
  const providerURL = `https://${network}.infura.io`
  const HDWalletProvider = require('truffle-hdwallet-provider')
  let mnemonic = ''
  if (fs.existsSync('secrets.json')) {
    // eslint-disable-next-line import/no-unresolved
    ({ mnemonic } = require('./secrets.json'))
  } else {
    console.log('No secrets.json found.')
  }
  provider = new HDWalletProvider(mnemonic, providerURL, 0)
  address = provider.getAddress()
  console.log('Provider address', provider.getAddress())
  console.log('Deploying to ', providerURL)
}

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    test: {
      host: 'localhost',
      port: 8545,
      network_id: 213,
      from: '0x92764CF5cc09B6345cf7D4b05AB3bF59052E2c01'
    },
    rinkeby: {
      provider,
      network_id: 4,
      from: address
    }
  }
}

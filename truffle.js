const HDWalletProvider = require('truffle-hdwallet-provider')

const address = process.env.TRUSTMESH_ETH_SENDER

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: new HDWalletProvider(process.env.TRUSTMESH_MNEMONIC, 'https://rinkeby.infura.io', 0),
      network_id: 4,
      from: address && address.toLowerCase()
    }
  }
}

const yargs = require('yargs')
const fs = require('fs')
const HDWalletProvider = require('truffle-hdwallet-provider')

let configs
try {
  // try to load config file
  configs = require('./deploy.config.json')
} catch (err) {
  // default configurations
  configs = {
    port: 8545,
    host: 'localhost',
    wallet: {
      mnemonic: '',
      index: 0
    }
  }
}

// command line arguments
const argv = yargs.argv
// aliases
Object.assign(argv, {
  port: argv.p,
  host: argv.h,
  mnemonic: argv.m,
  index: argv.i
})

function getDeployConfigs(options) {
  const { 
    networkID = '*',
    host = configs.host,
    port: configPort = configs.port,
    mnemonic = configs.wallet.mnemonic,
    index = configs.wallet.index,
    gas = configs.gas,
    gasPrice = configs.gasPrice,
    from = configs.from,
    useHttps = configs.useHttps,
  } = Object.assign({}, argv, options)

  const port = typeof configPort !== 'undefined'
    ? Number(configPort)
    : Boolean(useHttps) ? 443 : 80

  const provider = networkID !== '*' && mnemonic !== ''
    ? new HDWalletProvider(
        mnemonic,
        `${Boolean(useHttps) ? 'https' : 'http'}://${host}:${port}`,
        Number(index)
      )
    : undefined

  return {
    host: provider ? undefined : host,
    port: provider ? undefined : port,
    network_id: networkID,
    gas,
    gasPrice,
    from: from !== '' ? from : undefined,
    provider
  }
}

module.exports = {
  networks: {
    // default network
    development: getDeployConfigs(),
    // specified by --network
    mainnet: getDeployConfigs({
      host: 'mainnet.infura.io',
      useHttps: true,
      port: 443,
      networkID: 1
    }),
    rinkeby: getDeployConfigs({
      host: 'rinkeby.infura.io',
      useHttps: true,
      port: 443,
      networkID: 4
    })
  }
}

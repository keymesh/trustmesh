const bip39 = require('bip39')
const hdkey = require('ethereumjs-wallet/hdkey')
const ProviderEngine = require('web3-provider-engine')
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js')
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const FetchSubprovider = require('web3-provider-engine/subproviders/fetch.js')

class HDWalletProvider {
  constructor(mnemonic, providerUrl, addressIndex = 0) {
    this.mnemonic = mnemonic
    this.hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic))

    this.wallet_hdpath = "m/44'/60'/0'/0/"
    this.wallet = this.hdwallet.derivePath(this.wallet_hdpath + addressIndex).getWallet()
    this.address = `0x${this.wallet.getAddress().toString('hex')}`

    const engine = new ProviderEngine()
    engine.addProvider(new CacheSubprovider())
    engine.addProvider(new FilterSubprovider())
    engine.addProvider(new NonceSubprovider())
    engine.addProvider(new WalletSubprovider(this.wallet, {}))
    engine.addProvider(new FetchSubprovider({ rpcUrl: providerUrl }))
    this.engine = engine
    this.engine.start()
  }

  sendAsync(...args) {
    return this.engine.sendAsync(...args)
  }

  send(...args) {
    return this.engine.sendAsync(...args)
  }

  getAddress() {
    return this.address
  }
}

module.exports = HDWalletProvider

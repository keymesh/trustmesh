const Web3 = require('./web3.lib')

const TrustbaseError = require('./TrustbaseError')

let web3
let currentNetworkId

function checkWeb3() {
  if (web3 === undefined) {
    throw new TrustbaseError('You must run `trustbase.initialize` to initialize first!', TrustbaseError.CODE.UNINITIALIZED_WEB3)
  }
}

function getWeb3() {
  checkWeb3()
  return web3
}

async function initialize(options) {
  if (web3 !== undefined) {
    throw new TrustbaseError('`trustbase.initialize` should not be invoked twice!', TrustbaseError.CODE.INITIALIZED_ALREADY)
  }

  if (!options.provider) {
    throw new TrustbaseError('You must provide a provider for initialization', TrustbaseError.CODE.PROVIDER_NOT_PROVIDED)
  }

  web3 = new Web3(options.provider)

  currentNetworkId = await web3.eth.net.getId()

  const accounts = await web3.eth.getAccounts()
  let defaultAccount = options.defaultAccount

  if (defaultAccount) {
    if (!web3.utils.isAddress(defaultAccount)) {
      throw new TrustbaseError('Invalid account address', TrustbaseError.CODE.INVALID_ACCOUNT_ADDRESS)
    }

    if (accounts.indexOf(defaultAccount) === -1) {
      throw new TrustbaseError(`Account not found in detected network (Network ID: ${currentNetworkId})`, TrustbaseError.CODE.ACCOUNT_NOT_EXIST)
    }
  } else {
    if (accounts.length === 0) {
      throw new TrustbaseError(`No account found in detected network (Network ID: ${currentNetworkId})`, TrustbaseError.CODE.FOUND_NO_ACCOUNT)
    }

    defaultAccount = accounts[0]
  }

  web3.eth.defaultAccount = defaultAccount
}

function getContractInstance(contractName, abi, options) {
  checkWeb3()

  const {
    networks = {},
    networkId = currentNetworkId,
    address = getAddressFromNetworks(), // eslint-disable-line
  } = options

  function getAddressFromNetworks() {
    const network = networks[networkId]
    if (!network) {
      throw new TrustbaseError(`${contractName} has not been deployed to detected network (network/artifact mismatch)`, TrustbaseError.CODE.NETWORK_MISMATCH)
    }

    if (!network.address) {
      throw new TrustbaseError(`${contractName} has not been deployed to detected network (${networkId})`, TrustbaseError.CODE.NETWORK_MISMATCH)
    }

    return network.address
  }

  if (!web3.utils.isAddress(address)) {
    throw new TrustbaseError('Invalid contract address', TrustbaseError.CODE.INVALID_CONTRACT_ADDRESS)
  }

  return new web3.eth.Contract(abi, address)
}

function getUsernameHash(username) {
  checkWeb3()
  return web3.utils.sha3(username)
}

module.exports = {
  getWeb3,
  initialize,
  getContractInstance,
  getUsernameHash
}

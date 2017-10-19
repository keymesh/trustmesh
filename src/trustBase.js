const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/TrustBase')

async function getInstance(getContractInstance, web3) {
  const trustbase = await getContractInstance(contractName, abi, networks)

  async function register(name, identityKey, _options) {
    const nameHash = web3.utils.sha3(name)

    return trustbase.methods.register(nameHash, identityKey).send({
      gas: 100000,
      ..._options
    })
  }

  async function getIdentity(name, _options) {
    const nameHash = web3.utils.sha3(name)

    return trustbase.methods.getIdentity(nameHash).call(_options)
  }

  return {
    contract: trustbase,
    register,
    getIdentity
  }
}

module.exports = {
  getInstance
}

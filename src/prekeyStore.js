const {
  getUnixToday
} = require('./utils')

const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/PrekeyStore')

async function getInstance(getContractInstance, web3) {
  const prekeyStore = await getContractInstance(contractName, abi, networks)

  async function uploadPrekeys(name, prekeysPublicKeys, _options = {}) {
    const nameHash = web3.utils.sha3(name)
    const {
      interval = 1,
      fromUnixDay = getUnixToday(),
      ...otherOptions
    } = _options

    return prekeyStore.methods.addPrekeys(
      nameHash,
      prekeysPublicKeys,
      fromUnixDay,
      interval
    ).send({
      gas: 4712380,
      ...otherOptions
    })
  }

  async function getPrekey(name, unixDay, _options) {
    const nameHash = web3.utils.sha3(name)

    return prekeyStore.methods.getPrekey(nameHash, unixDay).call(_options)
  }

  async function getMetaData(name, _options) {
    const nameHash = web3.utils.sha3(name)

    return prekeyStore.methods.getMetaData(nameHash).call(_options)
  }

  return {
    contract: prekeyStore,
    uploadPrekeys,
    getPrekey,
    getMetaData
  }
}

module.exports = {
  getInstance
}

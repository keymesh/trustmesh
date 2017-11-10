const Trustbase = artifacts.require('./Trustbase.sol')
const PreKeyStore = artifacts.require('./PreKeyStore.sol')
const Messages = artifacts.require('./Messages.sol')

module.exports = (deployer) => {
  deployer.deploy(Trustbase)
    .then(() => deployer.deploy(PreKeyStore, Trustbase.address))
    .then(() => deployer.deploy(Messages))
}

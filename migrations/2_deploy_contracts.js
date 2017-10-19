const TrustBase = artifacts.require('./TrustBase.sol')
const PrekeyStore = artifacts.require('./PrekeyStore.sol')

module.exports = (deployer) => {
  deployer.deploy(TrustBase).then(() => deployer.deploy(PrekeyStore, TrustBase.address))
}

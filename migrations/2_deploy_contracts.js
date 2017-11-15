const Identities = artifacts.require('./Identities.sol')
const PreKeys = artifacts.require('./PreKeys.sol')
const Messages = artifacts.require('./Messages.sol')

module.exports = (deployer) => {
  deployer.deploy(Identities)
    .then(() => deployer.deploy(PreKeys, Identities.address))
    .then(() => deployer.deploy(Messages))
}

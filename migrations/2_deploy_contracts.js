const Identities = artifacts.require('./Identities.sol')
const Messages = artifacts.require('./Messages.sol')

module.exports = (deployer) => {
  deployer.deploy(Identities)
  deployer.deploy(Messages)
}

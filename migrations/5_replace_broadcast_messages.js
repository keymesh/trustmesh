const BroadcastMessages = artifacts.require('./BroadcastMessages.sol')

module.exports = (deployer) => {
  deployer.deploy(BroadcastMessages)
}

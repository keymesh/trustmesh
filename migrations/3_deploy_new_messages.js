const Trustbase = artifacts.require('./Trustbase.sol')
const Messages = artifacts.require('./Messages.sol')

module.exports = (deployer) => {
  Trustbase.deployed().then(() => deployer.deploy(Messages, Trustbase.address))
}

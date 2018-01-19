const BoundSocials = artifacts.require('./BoundSocials.sol')

module.exports = (deployer) => {
  deployer.deploy(BoundSocials)
}

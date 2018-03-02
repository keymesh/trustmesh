const SocialProofs = artifacts.require('./SocialProofs.sol')

module.exports = (deployer) => {
  deployer.deploy(SocialProofs)
}

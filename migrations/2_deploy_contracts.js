const TrustBase = artifacts.require("./TrustBase.sol");

module.exports = function(deployer) {
  deployer.deploy(TrustBase);
};

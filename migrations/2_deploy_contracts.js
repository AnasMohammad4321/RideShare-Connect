const RideShareConnect = artifacts.require("contracts/RideShareConnect.sol");

module.exports = function (deployer) {
  deployer.deploy(RideShareConnect);
};

// truffle-contract.js
import RideShareConnectArtifact from './build/contracts/RideShareConnect.json';
import TruffleContract from 'truffle-contract';

const RideShareConnect = TruffleContract(RideShareConnectArtifact);
RideShareConnect.setProvider(web3.currentProvider);

export default {
  RideShareConnect: RideShareConnect
};
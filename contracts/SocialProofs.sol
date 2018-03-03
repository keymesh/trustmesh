pragma solidity ^0.4.18;

contract SocialProofs {
  event ProofEvent(address indexed userAddress, bytes32 indexed platformName, bytes data);

  function uploadProof(address userAddress, bytes32 platformName, bytes data) public {
    ProofEvent(userAddress, platformName, data);
  }
}

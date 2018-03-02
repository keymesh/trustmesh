pragma solidity ^0.4.0;

contract SocialProofs {
  event ProofEvent(address indexed userAddress, bytes16 indexed platformName, bytes data);

  function proof(address userAddress, bytes16 platformName, bytes data) public {
    ProofEvent(userAddress, platformName, data);
  }
}

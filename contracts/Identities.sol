pragma solidity ^0.4.0;

contract Identities {
  struct Account {
    bytes32 publicKey;
    uint blockNumber;
  }

  mapping (address => Account) accounts;

  event RegisterOK(address indexed userAddress, bytes32 publicKey);

  function register(bytes32 publicKey) public {
    accounts[msg.sender] = Account(publicKey, block.number);
    RegisterOK(msg.sender, publicKey);
  }

  function getIdentity(address userAddress)
    constant
    public
    returns (bytes32 publicKey, uint blockNumber)
  {
    publicKey = accounts[userAddress].publicKey;
    blockNumber = accounts[userAddress].blockNumber;
  }
}

pragma solidity ^0.4.0;

contract Identities {
  struct Account {
    bytes32 publicKey;
    uint blockNumber;
  }

  mapping (address => Account) accounts;

  function register(bytes32 publicKey) public {
    require(accounts[msg.sender].publicKey == 0);
    accounts[msg.sender] = Account(publicKey, block.number);
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

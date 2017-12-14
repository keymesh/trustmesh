pragma solidity ^0.4.0;

contract Identities {
  struct Account {
    address owner;
    bytes32 publicKey;
    uint blockNumber;
  }

  mapping (bytes32 => Account) accounts;

  function register(bytes32 usernameHash, bytes32 publicKey) public {
    require(accounts[usernameHash].owner == 0);
    accounts[usernameHash] = Account(msg.sender, publicKey, block.number);
  }

  function isOwner(bytes32 usernameHash, address userAddress) constant public returns (bool) {
    return userAddress == accounts[usernameHash].owner;
  }

  function getIdentity(bytes32 usernameHash)
    constant
    public
    returns (address owner, bytes32 publicKey, uint blockNumber) 
  {
    owner = accounts[usernameHash].owner;
    publicKey = accounts[usernameHash].publicKey;
    blockNumber = accounts[usernameHash].blockNumber;
  }
}

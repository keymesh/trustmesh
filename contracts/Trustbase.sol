pragma solidity ^0.4.0;

contract Trustbase {
  event Register(address indexed from, bytes32 indexed nameHash, bytes32 identityKey);

  struct Account {
    address owner;
    bytes32 identityKey;
  }

  mapping (bytes32 => Account) accounts;

  function isOwner(address msgSender, bytes32 nameHash) constant returns (bool) {
    return msgSender == accounts[nameHash].owner;
  }

  function register(bytes32 nameHash, bytes32 identityKey) {
    require(accounts[nameHash].owner == 0);
    accounts[nameHash] = Account(msg.sender, identityKey);
    Register(msg.sender, nameHash, identityKey);
  }

  function getIdentity(bytes32 nameHash) constant returns (bytes32) {
    return accounts[nameHash].identityKey;
  }
}

pragma solidity ^0.4.0;

import {Identities} from 'contracts/Identities.sol';

contract PreKeys {
  Identities identities;

  event Upload(bytes32 indexed usernameHash, bytes preKeys, uint updateAt);

  modifier onlyOwner(bytes32 usernameHash) {
    require(identities.isOwner(usernameHash, msg.sender));
    _;
  }

  function PreKeys(address identitiesAddress) public {
    require(identitiesAddress != 0);
    identities = Identities(identitiesAddress);
  }

  function upload(bytes32 usernameHash, bytes preKeys) public onlyOwner(usernameHash) {
    Upload(usernameHash, preKeys, now);
  }
}

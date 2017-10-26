pragma solidity ^0.4.0;

import {Trustbase} from 'contracts/Trustbase.sol';

contract Messages {
  Trustbase trustbase;
  uint public blockNumber;

  event Publish(bytes32 indexed messageTypeHash, bytes32 senderUserHash, bytes message, uint timestamp);

  modifier onlyOwner(bytes32 nameHash) {
    require(trustbase.isOwner(msg.sender, nameHash));
    _;
  }

  function Messages(address trustbaseAddress) public {
    require(trustbaseAddress != 0);
    trustbase = Trustbase(trustbaseAddress);
    blockNumber = block.number;
  }

  function publish(
    bytes32 messageTypeHash,
    bytes32 senderUserHash,
    bytes message
  )
    public
    onlyOwner(senderUserHash)
  {
    Publish(messageTypeHash, senderUserHash, message, now);
  }
}

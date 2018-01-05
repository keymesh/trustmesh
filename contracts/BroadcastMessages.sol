pragma solidity ^0.4.0;

contract BroadcastMessages {
  event Publish(bytes signedMessage, address userAddress, uint timestamp);

  function publish(bytes signedMessage, address userAddress) public {
    Publish(signedMessage,  userAddress, now);
  }
}

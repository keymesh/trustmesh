pragma solidity ^0.4.18;

contract Messages {
  event Publish(bytes message, uint timestamp);

  function publish(bytes message) public {
    Publish(message, now);
  }
}

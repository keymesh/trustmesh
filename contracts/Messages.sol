pragma solidity ^0.4.0;

contract Messages {
  uint createdBlockNumber;
  event Publish(bytes message);

  function Messages() {
    createdBlockNumber = block.number;
  }

  function publish(bytes message) {
    Publish(message);
  }
}

pragma solidity ^0.4.0;

contract TrustBase {
	event Publish(address indexed from, bytes32 indexed name, bytes32 publicKey);

	struct PublicKey {
		address owner;
		bytes32 value;
	}

	mapping (bytes32 => PublicKey) publicKeys;

	function publishKey(bytes32 name, bytes32 publicKey) {
		require(publicKeys[name].owner == 0);
		publicKeys[name] = PublicKey(msg.sender, publicKey);
		Publish(msg.sender, name, publicKey);
	}

	function publicKeyOf(bytes32 name) constant returns (bytes32) {
		return publicKeys[name].value;
	}
}

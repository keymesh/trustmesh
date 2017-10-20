pragma solidity ^0.4.0;

import {Trustbase} from 'contracts/Trustbase.sol';

contract PreKeyStore {
  Trustbase trustbase;

  struct Prekeys {
    mapping (uint => bytes32) prekeys;
    uint lastPrekeysDate;
    uint interval;
  }

  mapping (bytes32 => Prekeys) accounts;

  modifier onlyOwner(bytes32 nameHash) {
    require(trustbase.isOwner(msg.sender, nameHash));
    _;
  }

  function PreKeyStore(address trustbaseAddress) {
    require(trustbaseAddress != 0);
    trustbase = Trustbase(trustbaseAddress);
  }

  function addPrekeys(
    bytes32 nameHash,
    bytes32[] prekeys,
    uint fromUnixDay,
    uint interval
  )
    onlyOwner(nameHash)
  {
    uint i = 0;
    uint lastPrekeysDate = accounts[nameHash].lastPrekeysDate;
    if (fromUnixDay <= lastPrekeysDate) {
      i = fromUnixDay;
      while (i <= lastPrekeysDate) {
        if (accounts[nameHash].prekeys[i] != 0) {
          delete accounts[nameHash].prekeys[i];
        }
        i += 1;
      }
    }

    i = 0;
    uint j = fromUnixDay;
    uint prekeysLength = prekeys.length;
    while (i < prekeysLength) {
      accounts[nameHash].prekeys[j] = prekeys[i];
      i++;
      j += interval;
    }
    accounts[nameHash].prekeys[65535] = prekeys[prekeysLength - 1]; // last resort prekey
    accounts[nameHash].lastPrekeysDate = j;
    accounts[nameHash].interval = interval;
  }

  function getPrekey(bytes32 nameHash, uint timestampOfDay) constant returns (bytes32) {
    return accounts[nameHash].prekeys[timestampOfDay];
  }

  function getMetaData(bytes32 nameHash) constant returns (
    uint lastPrekeysDate,
    uint interval
  ) {
    lastPrekeysDate = accounts[nameHash].lastPrekeysDate;
    interval = accounts[nameHash].interval;
  }
}

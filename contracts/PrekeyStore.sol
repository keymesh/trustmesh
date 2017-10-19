pragma solidity ^0.4.0;

import {TrustBase} from 'contracts/TrustBase.sol';

contract PrekeyStore {
  TrustBase trustBase;

  struct Prekeys {
    mapping (uint => bytes32) prekeys;
    uint lastPrekeysDate;
    uint interval;
  }

  mapping (bytes32 => Prekeys) accounts;

  modifier onlyOwner(bytes32 nameHash) {
    require(trustBase.isOwner(msg.sender, nameHash));
    _;
  }

  function PrekeyStore(address trustbaseAddress) {
    require(trustbaseAddress != 0);
    trustBase = TrustBase(trustbaseAddress);
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

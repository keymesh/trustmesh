import { Tx, PromiEvent, TransactionReceipt, BlockType } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/Identities.json'

export class Identities extends BaseContract {
  public static info = info

  public register(identityPublicKey: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.register(identityPublicKey)
      .send({ from: this.web3.eth.defaultAccount, ...options })
  }

  public getIdentity(userAddress: string, options: Tx = {}): Promise<IIdentity> {
    return this.contract.methods.getIdentity(userAddress)
      .call(options)
  }

  public getIdentities(
    { userAddresses, ...restOptions }: IGetPublicKeysOptions = {},
  ): Promise<IQueriedPublicKeys> {
    return this.getEventsData<IIdentityLog>('RegisterOK', { ...restOptions, filter: { userAddress: userAddresses } })
  }
}

export interface IIdentity {
  publicKey: string
  blockNumber: number
  0: string
  1: number
}

// TODO: public new Identities contract in order to get blockNumber
export interface IIdentityLog {
  userAddress: string
  publicKey: string
  // blockNumber: number
}

export interface IQueriedPublicKeys {
  lastBlock: number
  result: IIdentityLog[]
}

export interface IGetPublicKeysOptions {
  fromBlock?: BlockType,
  toBlock?: BlockType,
  userAddresses?: string[],
}

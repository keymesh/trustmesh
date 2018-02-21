import { Tx, PromiEvent, TransactionReceipt } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/Identities.json'

export class Identities extends BaseContract {
  public static info: IDeployInfo = info

  public register(identityPublicKey: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.register(identityPublicKey).send(options)
  }

  public getIdentity(userAddress: string, options: Tx = {}): Promise<IIdentity> {
    return this.contract.methods.getIdentity(userAddress).call(options)
  }
}

export interface IIdentity {
  publicKey: string
  blockNumber: number
  0: string
  1: number
}

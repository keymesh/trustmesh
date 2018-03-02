import { Tx, PromiEvent, TransactionReceipt, BlockType } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/SocialProofs.json'

export class SocialProofs extends BaseContract {
  public static info = info

  public proof(
    userAddress: string,
    platformName: string,
    data: string,
    options: Tx = {},
  ): PromiEvent<TransactionReceipt> {
    return this.contract.methods.proof(userAddress, platformName, data)
      .send({ from: this.web3.eth.defaultAccount, ...options })
  }

  public ProofEvent(
    { filter, ...restOptions }: IGetProofEventOptions = {},
  ): Promise<IQueriedProofEvent> {
    return super.getEventsData<IProofEvent>('ProofEvent', { ...restOptions, filter })
  }
}

export interface IProofEvent {
  userAddress: string
  platformName: string
  data: string
}

export interface IQueriedProofEvent {
  lastBlock: number
  result: IProofEvent[]
}

export interface IGetProofEventOptions {
  fromBlock?: BlockType
  toBlock?: BlockType
  filter?: IGetProofEventFilter
}

export interface IGetProofEventFilter {
  userAddress?: string
  platformName?: string
}

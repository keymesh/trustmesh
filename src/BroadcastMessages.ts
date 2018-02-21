import { Tx, PromiEvent, TransactionReceipt, BlockType } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/BroadcastMessages.json'

export class BroadcastMessages extends BaseContract {
  public static info = info

  public publish(userAddress: string, signedMessage: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.publish(userAddress, signedMessage).send(options)
  }

  public getBroadcastMessages(
    { userAddress, ...restOptions }: IGetBroadcastMessagesOptions = {},
  ): Promise<IQueriedBroadcastMessages> {
    return super.getEventsData<IBroadcastMessage>('Publish', { ...restOptions, filter: { userAddress } })
  }
}

export interface IBroadcastMessage {
  signedMessage: string
  userAddress: string
  timestamp: string
}

export interface IQueriedBroadcastMessages {
  lastBlock: number
  result: IBroadcastMessage[]
}

export interface IGetBroadcastMessagesOptions {
  fromBlock?: BlockType,
  toBlock?: BlockType,
  userAddress?: string,
}

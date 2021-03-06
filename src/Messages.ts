import { Tx, BlockType, PromiEvent, TransactionReceipt } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/Messages.json'

export class Messages extends BaseContract {
  public static info: IDeployInfo = info

  public publish(message: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.publish(message).send({ from: this.web3.eth.defaultAccount, ...options })
  }

  public async getMessages(options: IGetMessagesOptions = {}): Promise<IQueriedMessages> {
    return this.getEventsData<IMessage>('Publish', options)
  }
}

export interface IMessage {
  message: string
  timestamp: string
}

export interface IQueriedMessages {
  lastBlock: number
  result: IMessage[]
}

export interface IGetMessagesOptions {
  fromBlock?: BlockType,
  toBlock?: BlockType,
}

import { Tx, BlockType } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/Messages.json'

import {
  transactionPromiEventToPromise,
  getProcessingTransactionHandlers,
  IProcessingTransaction,
} from './utils'

export class Messages extends BaseContract {
  public static info: IDeployInfo = info

  public async publish(message: string, options: Tx = {}): Promise<IProcessingTransaction> {
    const transactionHash = await transactionPromiEventToPromise(
      this.contract.methods.publish(message).send({ from: this.web3.eth.defaultAccount, ...options }),
    )
    const handlers = getProcessingTransactionHandlers(this.web3, transactionHash)

    return {
      transactionHash,
      ...handlers,
    }
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

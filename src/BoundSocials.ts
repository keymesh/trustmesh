import { Tx, PromiEvent, TransactionReceipt, BlockType } from 'web3/types'

import { BaseContract, IDeployInfo } from './BaseContract'
import { IEventLogFilter } from './web3-types'

const info: IDeployInfo = require('../build/contracts/BoundSocials.json')

// FIXME: Make a PR to web3.js to make this an interface

export interface IBindEvent {
  userAddress: string,
  signedBoundSocials: string,
}

export interface IQueriedBindEvents {
  lastBlock: number
  bindEvents: IBindEvent[]
}

export class BoundSocials extends BaseContract {

  public bind(userAddress: string, signedBoundSocials: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.bind(userAddress, signedBoundSocials).send({
      from: this.web3.eth.defaultAccount,
      gas: 200000,
      gasPrice: 20000000000, // 20 Gwei
      ...options,
    })
  }

  async getBindEvents(options: IEventLogFilter = {}): Promise<IQueriedBindEvents> {
    const lastBlock = await this.web3.eth.getBlockNumber()

    const events = await this.contract.getPastEvents('Bind', Object.assign({
      toBlock: lastBlock
    }, options))

    const bindEvents = events.map((event) => {
      const {
        blockNumber,
      } = event

      const {
        userAddress,
        signedBoundSocials,
      } = event.returnValues as IBindEvent

      // pending event
      if (blockNumber === null) {
        return null
      }

      return {
        userAddress,
        signedBoundSocials
      }
    }).filter(m => m !== null) as IBindEvent[]

    return {
      lastBlock,
      bindEvents
    }
  }
}

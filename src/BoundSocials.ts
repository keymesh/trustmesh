import { Tx, PromiEvent, TransactionReceipt, BlockType } from 'web3/types'

import { BaseContract } from './BaseContract'

import * as info from '../build/contracts/BoundSocials.json'

export class BoundSocials extends BaseContract {
  public static info = info

  public bind(userAddress: string, signedBoundSocials: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.send(userAddress, signedBoundSocials).send(options)
  }

  public getBindings({ userAddress, ...restOptions }: IGetBindingsOptions = {}): Promise<IQueriedBindings> {
    return super.getEventsData<IBindings>('Bind', { ...restOptions, filter: { userAddress } })
  }
}

export interface IBindings {
  userAddress: string,
  signedBoundSocials: string,
}

export interface IQueriedBindings {
  lastBlock: number
  result: IBindings[]
}

export interface IGetBindingsOptions {
  fromBlock?: BlockType,
  toBlock?: BlockType,
  userAddress?: string,
}

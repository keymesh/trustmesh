import Web3 from 'web3'
import { Contract, BlockType } from 'web3/types'

export abstract class BaseContract {
  public static info: IDeployInfo

  constructor(
    protected web3: Web3,
    protected contract: Contract,
  ) {}

  protected async getEventsData<T extends object>(
    eventName: string,
    options: IEventLogFilter,
  ): Promise<{ lastBlock: number, result: T[] }> {
    const lastBlock = (
      typeof options.toBlock !== 'undefined'
      ? options.toBlock as number
      : await this.web3.eth.getBlockNumber()
    )
    const events = await this.contract.getPastEvents(eventName, Object.assign({ toBlock: lastBlock }, options))
    const result = events.reduce<T[]>(
      // filter out pending events (blockNumber === null)
      (_result, event) => event.blockNumber === null ? _result : _result.concat(event.returnValues as T),
      [],
    )

    return {
      lastBlock,
      result,
    }
  }
}

// FIXME: Make a PR to web3.js to make this an interface
export interface IEventLogFilter {
  filter?: object,
  fromBlock?: BlockType,
  toBlock?: BlockType,
  topics?: string[]
}

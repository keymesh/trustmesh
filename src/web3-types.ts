import { BlockType } from "web3/types"

export interface IEventLogFilter {
  filter?: object,
  fromBlock?: BlockType,
  toBlock?: BlockType,
  topics?: string[]
}

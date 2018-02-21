import { BlockType } from "web3/types"

// FIXME: Make a PR to web3.js to make this an interface
export interface IEventLogFilter {
  filter?: object,
  fromBlock?: BlockType,
  toBlock?: BlockType,
  topics?: string[]
}

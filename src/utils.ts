import Web3 from 'web3'
import { BlockType } from 'web3/types'

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export async function getToBlockNumber(web3: Web3, toBlock: BlockType = 'latest'): Promise<number> {
  switch (toBlock) {
    case 'genesis':
      return 0
    case 'latest':
    case 'pending':
      return web3.eth.getBlockNumber()
    default:
      return toBlock
  }
}

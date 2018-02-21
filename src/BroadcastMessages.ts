import { BaseContract, IDeployInfo } from "./BaseContract"
import { Tx, PromiEvent, TransactionReceipt } from "web3/types"

const info: IDeployInfo = require('../build/contracts/BroadcastMessages.json')

export interface IBroadcastMessage {
  signedMessage: string
  userAddress: string
  timestamp: string
}

export interface IQueriedBroadcastMessages {
  lastBlock: number
  broadcastMessages: Array<IBroadcastMessage>
}

export class BroadcastMessages extends BaseContract {
  public static info: IDeployInfo = info

  public publish(signedMessage: string, userAddress: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.publish(signedMessage, userAddress).send({
      from: this.web3.eth.defaultAccount,
      gas: 200000,
      gasPrice: 20000000000, // 20 Gwei
      ...options,
    })
  }

  public async getBroadcastMessages(options = {}): Promise<IQueriedBroadcastMessages> {
    const lastBlock = await this.web3.eth.getBlockNumber()

    const publishEvents = await this.contract.getPastEvents('Publish', Object.assign({
      toBlock: lastBlock
    }, options))

    const broadcastMessages = publishEvents.map((event) => {
      const {
        blockNumber,
      } = event

      const {
        signedMessage,
        userAddress,
        timestamp,
      } = event.returnValues as IBroadcastMessage

      // pending event
      if (blockNumber === null) {
        return null
      }

      return {
        signedMessage,
        userAddress,
        timestamp
      }
    }).filter(m => m !== null) as IBroadcastMessage[]

    return {
      lastBlock,
      broadcastMessages
    }
  }
}

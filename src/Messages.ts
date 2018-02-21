import { BaseContract, IDeployInfo } from "./BaseContract"
import { Tx, PromiEvent, TransactionReceipt } from "web3/types"

const info: IDeployInfo = require("../build/contracts/Messages.json")

export interface IMessage {
  message: string
  timestamp: string
}

export interface IQueriedMessages {
  lastBlock: number
  messages: IMessage[]
}

export class Messages extends BaseContract {
  public static info: IDeployInfo = info

  public publish(message: string, options: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.publish(message).send({
      from: this.web3.eth.defaultAccount,
      gas: 200000,
      gasPrice: 20000000000, // 20 Gwei
      ...options,
    })
  }

  public async getMessages(options: Tx = {}): Promise<IQueriedMessages> {
    const lastBlock = await this.web3.eth.getBlockNumber()

    const publishEvents = await this.contract.getPastEvents("Publish", Object.assign({
      toBlock: lastBlock,
    }, options))

    const messages = publishEvents.map((event) => {
      const {
        blockNumber,
      } = event

      const {
        message,
        timestamp,
      } = event.returnValues as IMessage

      // pending event
      if (blockNumber === null) {
        return null
      }

      return {
        message,
        timestamp,
      }
    }).filter((m) => m !== null) as IMessage[]

    return {
      lastBlock,
      messages,
    }
  }
}

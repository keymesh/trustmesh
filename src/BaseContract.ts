import Web3 from 'web3'
import { Contract, BlockType, PromiEvent, TransactionReceipt } from 'web3/types'
import { sleep } from './utils'

export abstract class BaseContract {
  public static info: IDeployInfo

  constructor(
    protected web3: Web3,
    protected contract: Contract,
  ) {}

  public getProcessingTransaction(transactionHash: string): IProcessingTransaction {
    let isPolling = true

    const getReceipt = async (
      requiredConfirmation: number = 0,
      estimateAverageBlockTime = 15000,
      timeoutBlockNumber = Infinity,
      onConfirmation?: TypeOnConfirmationCallback,
    ) => {
      let blockCounter = 0
      let isFirstConfirmation = true
      let firstConfirmedReceiptBlockNumber = 0
      while (isPolling) {
        if (blockCounter > timeoutBlockNumber) {
          throw new Error('Timeout')
        }

        const receipt = await this.web3.eth.getTransactionReceipt(transactionHash)
        // not yet confirmed or is pending
        if (receipt == null || receipt.blockNumber == null) {
          if (!isFirstConfirmation) {
            // receipt we had fetched is from a fork chain, reset data
            firstConfirmedReceiptBlockNumber = 0
            isFirstConfirmation = true
          }

          blockCounter++
          await sleep(estimateAverageBlockTime)
          continue
        }

        // check out of gas (or error)
        const hasStatus = receipt.status != null
        const hasTransactionError = (
          hasStatus
          ? Number(receipt.status) === TRANSACTION_STATUS.FAIL
          : receipt.gasUsed === receipt.cumulativeGasUsed
        )
        if (hasTransactionError) {
          throw new Error('Transaction process error')
        }

        const receiptBlockNumber = receipt.blockNumber
        if (isFirstConfirmation) {
          firstConfirmedReceiptBlockNumber = receiptBlockNumber
          isFirstConfirmation = false
        }

        const confirmationCounter = receiptBlockNumber - firstConfirmedReceiptBlockNumber
        // wait for more confirmations
        if (confirmationCounter < requiredConfirmation) {
          if (onConfirmation != null) {
            onConfirmation(confirmationCounter)
          }
          await sleep(estimateAverageBlockTime)
          continue
        }

        // enough confirmation, success
        return receipt
      }
      return
    }

    const stopGetReceipt = () => {
      isPolling = false
    }

    return {
      transactionHash,
      getReceipt,
      stopGetReceipt,
    }
  }

  protected async getEventsData<T extends object>(
    eventName: string,
    options: IEventLogFilter,
  ): Promise<{ lastBlock: number, result: T[] }> {
    const lastBlock = (
      options.toBlock != null
      ? options.toBlock as number
      : await this.web3.eth.getBlockNumber()
    )
    const events = await this.contract.getPastEvents(eventName, { toBlock: lastBlock, ...options })
    const result: T[] = []

    for (const event of events) {
      const isPending = event.blockNumber === null
      if (isPending) {
        continue
      }

      result.push(event.returnValues as T)
    }

    return {
      lastBlock,
      result,
    }
  }

  protected transactionPromiEventToPromsie(
    promiEvent: PromiEvent<TransactionReceipt>,
  ): Promise<IProcessingTransaction> {
    return new Promise((resolve, reject) => {
      promiEvent
        .on('transactionHash', (hash) => {
          resolve(this.getProcessingTransaction(hash))
        })
        .on('error', (error: Error) => {
          if (error.message.includes('Transaction was not mined within 50 blocks')) {
            // we don't know whether the tx was confirmed or not. don't do anything.
            return
          }
          reject(error)
        })
    })
  }
}

// FIXME: Make a PR to web3.js to make this an interface
export interface IEventLogFilter {
  filter?: object,
  fromBlock?: BlockType,
  toBlock?: BlockType,
  topics?: string[]
}

export enum TRANSACTION_STATUS {
  FAIL = 0,
  SUCCESS,
}

export interface IGetReceiptOptions {
  estimateAverageBlockTime?: number
}

export type TypeOnConfirmationCallback = (confirmationNumber: number) => void

export interface IProcessingTransaction {
  transactionHash: string,
  getReceipt(
    requiredConfirmation?: number,
    estimateAverageBlockTime?: number,
    timeoutBlockNumber?: number,
    onConfirmation?: TypeOnConfirmationCallback,
  ): Promise<TransactionReceipt | undefined>,
  stopGetReceipt(): void,
}

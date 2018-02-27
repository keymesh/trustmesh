import Web3 from 'web3'
import { PromiEvent, TransactionReceipt } from 'web3/types'

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export function transactionPromiEventToPromise(promiEvent: PromiEvent<TransactionReceipt>): Promise<string> {
  return new Promise((resolve, reject) => {
    promiEvent
      .on('transactionHash', (hash) => {
        resolve(hash)
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

export function getProcessingTransactionHandlers(web3: Web3, transactionHash: string): IProcessingTransactionHandlers {
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

      const receipt = await web3.eth.getTransactionReceipt(transactionHash)
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
    getReceipt,
    stopGetReceipt,
  }
}

export enum TRANSACTION_STATUS {
  FAIL = 0,
  SUCCESS,
}

export type TypeOnConfirmationCallback = (confirmationNumber: number) => void

export interface IProcessingTransactionHandlers {
  getReceipt(
    requiredConfirmation?: number,
    estimateAverageBlockTime?: number,
    timeoutBlockNumber?: number,
    onConfirmation?: TypeOnConfirmationCallback,
  ): Promise<TransactionReceipt | undefined>,
  stopGetReceipt(): void,
}

export interface IProcessingTransaction extends IProcessingTransactionHandlers {
  transactionHash: string,
}

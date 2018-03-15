import Web3 from 'web3'
import { PromiEvent, TransactionReceipt, BlockType, Log, Utils } from 'web3/types'

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

export function getProcessingTransactionHandlers(
  web3: Web3,
  transactionHash: string,
  // requiredEventSignature?: string,
): IProcessingTransactionHandlers {
  let isPolling = true

  const getReceipt = async (
    requiredConfirmation: number = 0,
    estimateAverageBlockTime = 15000,
    timeoutBlockNumber = Infinity,
    onConfirmation?: TypeOnConfirmationCallback,
  ) => {
    let lastBlockNumber: number | null = null
    let blockCounter = 0
    let isFirstConfirmation = true
    let firstConfirmedReceiptBlockNumber = 0
    while (isPolling) {
      if (blockCounter > timeoutBlockNumber) {
        throw new Error('Timeout')
      }

      const currentBlockNumber = await web3.eth.getBlockNumber()
      const receipt = await web3.eth.getTransactionReceipt(transactionHash)
      // not yet confirmed or is pending
      if (receipt == null || receipt.blockNumber == null) {
        if (!isFirstConfirmation) {
          // receipt we had fetched is from a fork chain, reset data
          firstConfirmedReceiptBlockNumber = 0
          isFirstConfirmation = true
        }

        if (lastBlockNumber != null) {
          blockCounter += currentBlockNumber - lastBlockNumber
        }
        lastBlockNumber = currentBlockNumber
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
      // TODO: check requiredEventSignature
      if (hasTransactionError) {
        throw new Error('Transaction process error')
      }

      const receiptBlockNumber = receipt.blockNumber
      if (isFirstConfirmation) {
        firstConfirmedReceiptBlockNumber = receiptBlockNumber
        isFirstConfirmation = false
      }

      const confirmationCounter = currentBlockNumber - firstConfirmedReceiptBlockNumber
      // wait for more confirmations
      if (confirmationCounter < requiredConfirmation) {
        if (onConfirmation != null) {
          // currentBlockNumber is possibly less than firstConfirmedReceiptBlockNumber.
          onConfirmation(confirmationCounter < 0 ? 0 : confirmationCounter)
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

export function getEventSignature(info: IDeployInfo, eventName: string): string {
  const jsonInterface = info.abi.find((method) =>
    method.type === 'event' &&
    method.name === eventName,
  )

  if (jsonInterface == null) {
    throw new Error(`cannot find ${eventName} event in the abi`)
  }

  return jsonInterfaceMethodToSignature(jsonInterface)
}

function jsonInterfaceMethodToSignature(method: IMethodABI): string {
  return ((Web3 as any).utils as Utils)
    .sha3(`${method.name}(${method.inputs.map((input) => input.type).join(',')})`)
    .slice(0, 10)
}

export function hasMatchSignatureLog(log: Log, signature: string): boolean {
  const logSignature = log.topics[0]

  return logSignature === signature
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

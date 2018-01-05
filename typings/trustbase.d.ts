import * as web3 from './web3.d'

declare interface AsyncProvider {
  sendAsync(payload: web3.JsonRPCRequest, callback: (e: Error, val: web3.JsonRPCResponse) => void): void
}

declare interface InitOptions {
  provider: AsyncProvider | string
  defaultAccount?: string
}

declare interface ContractOptions {
  networks?: {
    [networkId: number]: {
      address: string
    }
  }
  address?: string
  networkId?: number
}

declare interface ContractMethodOptions {
  from?: string
  gas?: string | number
  gasPrice?: string | number
}

declare interface Identity {
  publicKey: string
  blockNumber: number
  0: string
  1: number
}

declare interface GetMessagesOption {
  fromBlock?: web3.BlockType
  toBlock?: web3.BlockType
}

declare interface Message {
  message: string
  timestamp: string
}

declare interface QueriedMessages {
  lastBlock: number
  messages: Array<Message>
}

declare interface GetBroadcastMessagesOption {
  fromBlock?: web3.BlockType
  toBlock?: web3.BlockType
}

declare interface BroadcastMessage {
  message: string
  userAddress: string
  timestamp: string
}

declare interface QueriedBroadcastMessages {
  lastBlock: number
  broadcastMessages: Array<BroadcastMessage>
}

declare enum ErrorCode {
  UNKNOWN = 0,
  UNINITIALIZED_WEB3 = 100,
  INITIALIZED_ALREADY = 101,
  PROVIDER_NOT_PROVIDED = 102,
  INVALID_ACCOUNT_ADDRESS = 200,
  ACCOUNT_NOT_EXIST = 201,
  FOUND_NO_ACCOUNT = 202,
  NETWORK_MISMATCH = 300,
  INVALID_CONTRACT_ADDRESS = 301
}

declare module trustbase {
  function getWeb3(): web3.Web3
  function sha3(str: string): string
  function asciiToHex(str: string): string
  function hexToAscii(hex: string): string
  function initialize(options: InitOptions): Promise<void>

  class Identities {
    web3: web3.Web3
    contract: web3.Contract

    constructor(options?: ContractOptions)
    register(identityPublicKey: string, options?: ContractMethodOptions): web3.PromiEvent<web3.TransactionReceipt>
    getIdentity(userAddress: string, options?: ContractMethodOptions): Promise<Identity>
  }

  class Messages {
    web3: web3.Web3
    contract: web3.Contract

    constructor(options?: ContractOptions)
    publish(message: string, options?: ContractMethodOptions): web3.PromiEvent<web3.TransactionReceipt>
    getMessages(options: GetMessagesOption): Promise<QueriedMessages>
  }

  class BroadcastMessages {
    web3: web3.Web3
    contract: web3.Contract

    constructor(options?: ContractOptions)
    publish(signedMessage: string, userAddress: string, options?: ContractMethodOptions): web3.PromiEvent<web3.TransactionReceipt>
    getBroadcastMessages(options: GetBroadcastMessagesOption): Promise<QueriedBroadcastMessages>
  }

  class TrustbaseError extends Error {
    static readonly CODE: {
      UNKNOWN: ErrorCode.UNKNOWN
      UNINITIALIZED_WEB3: ErrorCode.UNINITIALIZED_WEB3
      INITIALIZED_ALREADY: ErrorCode.INITIALIZED_ALREADY
      PROVIDER_NOT_PROVIDED: ErrorCode.PROVIDER_NOT_PROVIDED
      INVALID_ACCOUNT_ADDRESS: ErrorCode.INVALID_ACCOUNT_ADDRESS
      ACCOUNT_NOT_EXIST: ErrorCode.ACCOUNT_NOT_EXIST
      FOUND_NO_ACCOUNT: ErrorCode.FOUND_NO_ACCOUNT
      NETWORK_MISMATCH: ErrorCode.NETWORK_MISMATCH
      INVALID_CONTRACT_ADDRESS: ErrorCode.INVALID_CONTRACT_ADDRESS
    }
    code: ErrorCode

    constructor(message: string, code?: ErrorCode)
  }
}

export = trustbase

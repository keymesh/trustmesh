import Web3 from 'web3'
import { Contract } from 'web3/types'

import { BaseContract } from './BaseContract'
import { Identities } from './Identities'
import { Messages } from './Messages'
import { SocialProofs } from './SocialProofs'
import { BroadcastMessages } from './BroadcastMessages'

/**
 * Construct a web3 Contract instance using deployment information produced by
 * Truffle.
 */
async function getContract<T extends BaseContract>(
  Klass: {
    info: typeof BaseContract.info;
    new (web3: Web3, contract: Contract): T;
  },
  web3: Web3,
  netid?: number,
): Promise<T> {
  if (netid == null) {
    netid = await web3.eth.net.getId()
  }

  const info: IDeployInfo = Klass.info

  const network = info.networks[netid]

  if (!network) {
    const className = Klass.name
    throw new Error(`The contract ${className} is not deployed`)
  }

  const contract = new web3.eth.Contract(info.abi, network.address)

  return new Klass(web3, contract)
}

export async function getContracts(web3: Web3): Promise<ITrustMeshContracts> {
  const netid = await web3.eth.net.getId()

  const identities = await getContract<Identities>(Identities, web3, netid)
  const messages = await getContract<Messages>(Messages, web3, netid)
  const socialProofs = await getContract<SocialProofs>(SocialProofs, web3, netid)
  const broadcastMessages = await getContract<BroadcastMessages>(BroadcastMessages, web3, netid)

  return {
    identities,
    messages,
    socialProofs,
    broadcastMessages,
  }
}

export {
  getProcessingTransactionHandlers,
  // re-export public API's typings
  IProcessingTransactionHandlers,
  IProcessingTransaction,

  transactionPromiEventToPromise,
} from './utils'

export interface ITrustMeshContracts {
  identities: Identities,
  messages: Messages,
  socialProofs: SocialProofs,
  broadcastMessages: BroadcastMessages,
}

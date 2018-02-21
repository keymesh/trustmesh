import { Tx, PromiEvent, TransactionReceipt } from "web3/types"

import { BaseContract, IDeployInfo } from "./BaseContract"

const info: IDeployInfo = require("../build/contracts/Identities.json")

export interface IIdentity {
  publicKey: string
  blockNumber: number
  0: string
  1: number
}

export class Identities extends BaseContract {
  public static info: IDeployInfo = info

  public register(identityPublicKey: string, opts: Tx = {}): PromiEvent<TransactionReceipt> {
    return this.contract.methods.register(identityPublicKey).send(Object.assign({
      // FIXME: can I assume that
      from: this.web3.eth.defaultAccount, // do we really need to set this??
      gas: 100000,
      gasPrice: 20000000000, // 20 Gwei
    }, opts))
  }

  public getIdentity(userAddress: string, opts: Tx = {}): Promise<IIdentity> {
    return this.contract.methods.getIdentity(userAddress).call(opts)
  }
}

import Web3 from "web3"
import { Contract } from "web3/types"

export interface IDeployInfo {
  contract_name: string,
  abi: any,
  networks: {
    [key: number]: {
      events: any,
      links: any,
      address: string,
      updated_at: number,
    },
  }
}

export abstract class BaseContract {
  public static info: IDeployInfo

  constructor(
    protected web3: Web3,
    protected contract: Contract,
  ) { }

  // protected static async _forWeb3(web3: Web3): Promise<any> {
  // const netid = await web3.eth.net.getId()
  // const network = this.info.networks[netid]

  // if (!network) {
  //   const className = this.name
  //   throw new Error(`The contract ${this.name} is not deployed`)
  // }

  // const contract = new web3.eth.Contract(this.info.abi, network.address)

  //   return new this(web3, contract)
  // }
}

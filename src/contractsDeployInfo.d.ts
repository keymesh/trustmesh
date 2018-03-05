
interface IDeployInfo {
  contract_name: string,
  abi: IMethodABI[],
  networks: {
    [id: number]: {
      events: any,
      links: any,
      address: string,
      updated_at: number,
    },
  }
}

interface IMethodABI {
  type: string,
  name?: string,
  inputs: any[],
}

declare module '../build/contracts/*.json' {
  const value: IDeployInfo
  export = value
}

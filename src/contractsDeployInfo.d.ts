
interface IDeployInfo {
  contract_name: string,
  abi: any,
  networks: {
    [id: number]: {
      events: any,
      links: any,
      address: string,
      updated_at: number,
    },
  }
}

declare module '../build/contracts/*.json' {
  const value: IDeployInfo
  export = value
}

# Trustmesh [![Build Status](https://travis-ci.org/keymesh/trustmesh.svg?branch=master)](https://travis-ci.org/keymesh/trustmesh)

Blockchain-based (Ethereum) Public key and message infrastructure. Can be use to build trusted communication DApp.

## Installation

```bash
yarn add @keymesh/trustmesh
```

## APIs

*TODO*

## Development

### Test

1. Run [Ethereum Test RPC (Ganache CLI)](https://github.com/trufflesuite/ganache-cli):

```bash
yarn testrpc
```

2. Run tests (in another console):

```bash
yarn test
```

### Deployment

#### Quick Start

```bash
# Using default localhost:8545
yarn migrate
```

#### Using [infura.io](https://infura.io/) and Mnemonic

```bash
yarn migrate --network rinkeby --mnemonic 'foo bar baz quz ...'
# or --network mainnet
```

<details>
  <summary>Advanced Deployment Configurations</summary>

  #### Command Line Options

  All options of `truffle migrate` (http://truffleframework.com/docs/advanced/commands#migrate) are supported.

  ```
    yarn migrate [options]

    Options:

      -h, --host       Ethereum node URL hostname
      -p, --port       Ethereum node URL port
      -m, --mnemonic   BIP32 HD wallet passphrase (Wallet client's passphrase, MetaMask's seed phrase)
      -i, --index      HD wallet index
      --useHttps       Use `https` instead of `http`
      --gas            Gas limit
      --gasPrice       Gas price
      --from           Address used during migrations
      
  ```

  #### Using `deploy.config.json`

  ```bash
  cp _deploy.config.json deploy.config.json
  ```
</details>


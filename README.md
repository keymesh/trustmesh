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
# Use TRUSTMESH_MNEMONIC and TRUSTMESH_ETH_SENDER to config
TRUSTMESH_MNEMONIC='foo bar baz quz...' \
TRUSTMESH_ETH_SENDER='0x123...' yarn migrate --network rinkeby
```


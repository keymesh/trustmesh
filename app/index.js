#!/usr/bin/env node
const yargs = require('yargs')
const Web3 = require('web3')
const inquirer = require('inquirer')
const hardRejection = require('hard-rejection')

hardRejection()

const HDWalletProvider = require('./provider')
const register = require('./register')
const checkRegister = require('./check-register')
const info = require('./info')

const {
  input,
  list
} = require('./prompts')
inquirer.registerPrompt('input', input)
inquirer.registerPrompt('list', list)

const isDev = process.env.NODE_ENV === 'development'

const {
  contract_name: contractName,
  abi,
  networks
} = require('../build/contracts/TrustBase')

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command('register', 'Register a new account', (_yargs) => {
    _yargs
      .usage('Usage: $0 register [username]')
  })
  .command('check-register', 'Check registration status', (_yargs) => {
    _yargs
      .usage('Usage: $0 check-register [options] [username]')
      .options({
        hash: {
          alias: 'h',
          describe: 'Use transaction hash'
        }
      })
  })
  .command('info', 'Get public key for a user', (_yargs) => {
    _yargs
      .usage('Usage: $0 info [username]')
  })
  .recommendCommands()
  .env('TRUSTBASE')
  .config()
  .options({
    address: {
      alias: 'a',
      describe: 'trustbase contract deployed address',
      string: true
    },
    provider: {
      alias: 'p',
      describe: 'RPC provider url'
    },
    from: {
      alias: 'f',
      describe: 'account address',
      string: true
    },
    mnemonic: {
      alias: 'm',
      describe: 'mnemonic for HD Wallet'
    },
    index: {
      alias: 'i',
      default: 0,
      number: true,
      describe: 'index for HD Wallet'
    }
  })
  .help('h')
  .alias('h', 'help')
  .demandCommand(1, '')
  .argv

async function setup() {
  let provider
  if (argv.provider) {
    provider = (
      argv.mnemonic
        ? new HDWalletProvider(argv.mnemonic, argv.provider, argv.index)
        : argv.provider
    )
  }

  const web3 = new Web3(isDev ? 'http://localhost:8545' : provider)

  let address = argv.address
  if (!address) {
    // Use official address
    const currentNetworkId = await web3.eth.net.getId()
    const network = networks[currentNetworkId]
    if (!network) {
      throw new Error(`${contractName} has not been deployed to detected network (network/artifact mismatch)`)
    }

    address = network.address
    if (!network.address) {
      throw new Error(`${contractName} has not been deployed to detected network (${currentNetworkId})`)
    }
  }
  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid trustbase address')
  }

  const code = await web3.eth.getCode(address)
  if (!code || code.replace('0x', '').replace(/0/g, '') === '') {
    throw new Error(`Cannot create instance of ${contractName}; no code at address ${address}`)
  }

  let from = argv.from
  if (!from) {
    web3.eth.extend({
      methods: [{
        name: 'getAccounts',
        call: 'eth_accounts'
      }]
    })

    const accounts = await web3.eth.getAccounts()

    if (accounts.length === 0) {
      throw new Error('No account found')
    }

    if (accounts.length === 1) {
      from = accounts[0]
    } else {
      ({ from } = await inquirer.prompt([{
        type: 'list',
        name: 'from',
        message: 'Select your account:',
        choices: accounts
      }]))
    }
  }

  const trustbase = new web3.eth.Contract(abi, address, {
    from
  })

  return {
    web3,
    trustbase
  }
}

setup()
  .then(({
    web3,
    trustbase
  }) => {
    const handlerOptions = {
      argv,
      inquirer,
      web3,
      trustbase
    }
    switch (argv._[0]) {
      case 'register':
        return register(handlerOptions)
      case 'check-register':
        return checkRegister(handlerOptions)
      case 'info':
        return info(handlerOptions)
      default:
        return yargs.showHelp()
    }
  })

const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const sodium = require('libsodium-wrappers-sumo')
const ora = require('ora')

const {
  RECORD_PATH
} = require('./constants')

const saveIdentity = require('./save-identity')
const checkRegister = require('./check-register')

const usernamePrompt = [
  {
    type: 'input',
    name: 'username',
    message: 'Username:'
  }
]

async function handleRegister({
  argv,
  web3,
  trustbase,
  inquirer
}) {
  const username = argv._.length > 1 ? argv._[1] : (await inquirer.prompt(usernamePrompt)).username
  if (username === '') {
    ora().fail('Invalid username')
    process.exit(1)
  }

  const usernameHash = web3.utils.sha3(username)

  let {
    publicKey,
    privateKey
  } = sodium.crypto_sign_keypair()
  publicKey = sodium.to_hex(publicKey)
  privateKey = sodium.to_hex(privateKey)

  const identityPath = path.resolve(os.homedir(), `.trustbase/idents/${usernameHash}.json`)
  if ((await fs.exists(identityPath))) {
    ora().info(`Found identity for '${username}' locally`)
    process.exit(0)
  }

  const records = (await fs.exists(RECORD_PATH)) ? (await fs.readJSON(RECORD_PATH)) : {}
  if (records[username]) {
    await checkRegister({
      argv: {
        _: ['check-register', username]
      },
      web3,
      inquirer,
      trustbase
    })
    return
  }

  const pK = await trustbase.methods.getIdentity(usernameHash).call()

  if (Number(pK) !== 0) {
    ora().fail('Username already registered. Try another account name.')
    process.exit(1)
  }

  const transactionSpinner = ora('Creating transaction').start()
  const waitTxSpinner = ora('Waiting for transaction')

  trustbase.methods.register(usernameHash, publicKey).send({
    gas: 100000
  })
    .on('transactionHash', (hash) => {
      transactionSpinner.succeed(`Transaction created: ${hash}`)
      const recordSpinner = ora('Saving register record').start()
      try {
        fs.ensureFileSync(RECORD_PATH)
        fs.writeJSONSync(RECORD_PATH, Object.assign({}, records, {
          [username]: {
            publicKey,
            privateKey,
            hash
          }
        }))
        recordSpinner.succeed('Register record saved')
      } catch (err) {
        recordSpinner.fail('Fail to save record:')
        console.error(err)
      }
      waitTxSpinner.start()
    })
    .on('receipt', async (r) => {
      fs.ensureFileSync(RECORD_PATH)
      await fs.writeJSON(RECORD_PATH, records)
      if (r.events.Publish) {
        waitTxSpinner.succeed('Registration success!')
        await saveIdentity({
          username,
          publicKey,
          privateKey,
          identityPath
        })
      } else {
        waitTxSpinner.fail('Username already registered. Try another account name.')
      }

      process.exit(0)
    })
    .on('error', async (err) => {
      fs.ensureFileSync(RECORD_PATH)
      await fs.writeJSON(RECORD_PATH, records)
      if (err.message.search('invalid opcode') !== -1) {
        transactionSpinner.fail('Username already registered. Try another account name.')
      } else {
        transactionSpinner.fail('Unexpected error:')
        console.error(err.message)
      }
      process.exit(1)
    })
}

module.exports = handleRegister

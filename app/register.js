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
    return
  }

  const usernameHash = web3.utils.sha3(username)

  let {
    publicKey,
    privateKey
  } = sodium.crypto_sign_keypair()
  publicKey = sodium.to_hex(publicKey)
  privateKey = sodium.to_hex(privateKey)

  const identityPath = path.resolve(os.homedir(), `.trustbase/idents/${usernameHash}.json`)
  // if ((await fs.exists(identityPath))) {
  //   ora().info(`Found identity for ${username} locally`)
  //   return
  // }

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

  const transactionSpinner = ora('Creating transaction').start()
  const waitTxSpinner = ora('Waiting for transaction')

  trustbase.methods.publishKey(usernameHash, publicKey).send()
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
    })
    .on('error', async (err) => {
      if (err.message.search('invalid opcode')) {
        transactionSpinner.fail('Username already registered. Try another account name.')
        await fs.writeJSON(RECORD_PATH, records)
      } else {
        transactionSpinner.fail('Unexpected error:')
        console.error(err)
      }
    })
}

module.exports = handleRegister

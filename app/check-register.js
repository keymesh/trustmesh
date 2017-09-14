const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const ora = require('ora')

const {
  RECORD_PATH
} = require('./constants')

const saveIdentity = require('./save-identity')

async function handleCheckRegister({
  argv,
  trustbase,
  inquirer,
  web3
}) {
  let username = ''
  const waitTxSpinner = ora('Waiting for transaction')

  const records = (await fs.exists(RECORD_PATH)) ? (await fs.readJSON(RECORD_PATH)) : {}
  const usernames = Object.keys(records)

  let hash = argv.hash
  if (hash) {
    const _username = usernames.find(name => records[name].hash === hash)
    if (!_username) {
      ora().fail(`Register record for transaction hash(${hash}) was not found on your machine`)
      return
    }
    username = _username
  } else if (argv._.length > 1) {
    username = argv._[1]
  } else if (usernames.length > 0) {
    ({ username } = await inquirer.prompt([{
      type: 'list',
      name: 'username',
      message: 'Select username:',
      choices: usernames
    }]))
  } else {
    ora().fail('No register record found')
    return
  }

  const usernameHash = web3.utils.sha3(username)
  const identityPath = path.resolve(os.homedir(), `.trustbase/idents/${usernameHash}.json`)
  if ((await fs.exists(identityPath))) {
    ora().succeed(`Found identity for ${username} locally`)
    return
  }

  if (!records[username]) {
    ora().warn(`Register record for username('${username}') was not found on your machine`)
    const publicKey = await trustbase.methods.publicKeyOf(usernameHash).call()
    if (Number(publicKey) === 0) {
      ora().info(`Username('${username}') has not been registered`)
    } else {
      ora().info(`Username('${username}') is already registered`)
    }
    return
  }

  hash = hash || records[username].hash

  const {
    publicKey,
    privateKey
  } = records[username]

  waitTxSpinner.start()

  const waitForTransactionReceipt = async () => {
    const receipt = await web3.eth.getTransactionReceipt(hash)
    if (receipt !== null) {
      delete records[username]
      waitTxSpinner.succeed('Registration success!')
      await saveIdentity({
        username,
        publicKey,
        privateKey,
        identityPath,
        records
      })
      return
    }

    setTimeout(waitForTransactionReceipt, 1000)
  }

  await waitForTransactionReceipt()
}

module.exports = handleCheckRegister

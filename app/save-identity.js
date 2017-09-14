const fs = require('fs-extra')
const ora = require('ora')
const chalk = require('chalk')

const {
  RECORD_PATH
} = require('./constants')

async function saveIdentity({
  username,
  publicKey,
  privateKey,
  identityPath,
  records
}) {
  const identitySpinner = ora('Saving identity').start()
  const identity = {
    username,
    publicKey,
    privateKey
  }
  try {
    await fs.writeJSON(identityPath, identity, {
      spaces: '    '
    })
    await fs.writeJSON(RECORD_PATH, records)
    identitySpinner.succeed(`Identity saved at: ${identityPath}`)
  } catch (err) {
    identitySpinner.fail('Fail to save identity')
    console.log(chalk.bgYellow.black('IMPORTANT: Please save your identity manually!'))
    console.log(JSON.stringify(identity, null, '    '))
  }
}

module.exports = saveIdentity

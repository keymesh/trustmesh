const ora = require('ora')

const usernamePrompt = [
  {
    type: 'input',
    name: 'username',
    message: 'Username:'
  }
]

async function handleInfo({
  argv,
  trustbase,
  inquirer,
  web3
}) {
  const username = argv._.length > 1 ? argv._[1] : (await inquirer.prompt(usernamePrompt)).username

  if (username === '') {
    ora().fail('Invalid username')
    process.exit(1)
  }

  const usernameHash = web3.utils.sha3(username)
  const publicKey = await trustbase.methods.publicKeyOf(usernameHash).call()
  if (Number(publicKey) === 0) {
    ora().info(`Username('${username}') not found`)
  } else {
    console.log(JSON.stringify({
      username,
      publicKey
    }, null, '    '))
  }

  process.exit(0)
}

module.exports = handleInfo

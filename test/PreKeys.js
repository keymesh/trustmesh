const expectThrow = require('./utils').expectThrow
const Identities = artifacts.require('Identities')
const PreKeys = artifacts.require('PreKeys')

contract('PreKeys', (accounts) => {
  const usernameHash = web3.sha3('ceoimon')
  const usernameHash2 = web3.sha3('howard')
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  const _publicKey2 = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34507'
  const _prekeys = '0x81334c1b677d64a5af480ed226b1671d6bd8c5b10b0f6d5f31b660a61cdeeb26'

  it('upload: should succeed in upload pre-keys', async () => {
    const identities = await Identities.new()
    await identities.register(usernameHash, _publicKey, { from: accounts[0] })
    const preKeys = await PreKeys.new(identities.address)

    const publishEvent = preKeys.Upload({ usernameHash })

    await new Promise((resolve) => {
      publishEvent.get((err, logs) => {
        assert.strictEqual(logs.length, 0)
        resolve()
      })
    })

    await preKeys.upload(usernameHash, _prekeys, { from: accounts[0] })

    await new Promise((resolve) => {
      publishEvent.get((err, logs) => {
        assert.strictEqual(logs.length, 1)
        assert.strictEqual(logs[0].args.preKeys, _prekeys)
        resolve()
      })
    })
  })

  it('upload: should fail when trying to upload pre-keys for others account', async () => {
    const identities = await Identities.new()
    await identities.register(usernameHash, _publicKey, { from: accounts[0] })
    await identities.register(usernameHash2, _publicKey2, { from: accounts[1] })
    const preKeys = await PreKeys.new(identities.address)

    expectThrow(preKeys.upload(usernameHash, _prekeys, { from: accounts[1] }))
  })
})

const expectThrow = require('./utils').expectThrow
const TrustBase = artifacts.require('TrustBase')
const sha3 = require('web3').utils.sha3

const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

contract('TrustBase', (accounts) => {
  let KT
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  beforeEach(async () => {
    KT = await TrustBase.new()
  })

  it('publishKey: should succeed in publishing a public key for a unregistered name', async () => {
    await KT.publishKey(sha3('ceoimon'), _publicKey, { from: accounts[0] })
  })

  it('publishKey: should fail when trying to publish a public key for a registered name', async () => {
    await KT.publishKey(sha3('ceoimon'), _publicKey, { from: accounts[0] })
    expectThrow(KT.publishKey(sha3('ceoimon'), _publicKey, { from: accounts[0] }))
  })

  it('publicKeyOf: should return public key of a registered name', async () => {
    await KT.publishKey(sha3('ceoimon'), _publicKey, { from: accounts[0] })
    const publicKey = await KT.publicKeyOf(sha3('ceoimon'))
    assert.strictEqual(publicKey, _publicKey)
  })

  it('publicKeyOf: should return a zero-value for a unregistered name', async () => {
    const publicKey = await KT.publicKeyOf(sha3('howard'))
    assert.strictEqual(publicKey, bytes32Zero)
  })
})

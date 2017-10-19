const expectThrow = require('./utils').expectThrow
const TrustBase = artifacts.require('TrustBase')
const sha3 = require('web3').utils.sha3

const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

contract('TrustBase', (accounts) => {
  let trustBase
  const nameHash = sha3('ceoimon')
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  beforeEach(async () => {
    trustBase = await TrustBase.new()
  })

  it('register: should succeed in publishing a public key for a unregistered name', async () => {
    await trustBase.register(nameHash, _publicKey, { from: accounts[0] })
  })

  it('register: should fail when trying to publish a public key for a registered name', async () => {
    await trustBase.register(nameHash, _publicKey, { from: accounts[0] })
    await expectThrow(trustBase.register(nameHash, _publicKey, { from: accounts[0] }))
  })

  it('getIdentity: should return public key of a registered name', async () => {
    await trustBase.register(nameHash, _publicKey, { from: accounts[0] })
    const publicKey = await trustBase.getIdentity(nameHash)
    assert.strictEqual(publicKey, _publicKey)
  })

  it('getIdentity: should return a zero-value for a unregistered name', async () => {
    const publicKey = await trustBase.getIdentity(sha3('howard'))
    assert.strictEqual(publicKey, bytes32Zero)
  })

  it('isOwner: should return sender is owner or not', async () => {
    await trustBase.register(nameHash, _publicKey, { from: accounts[0] })
    const isOwnerTrue = await trustBase.isOwner(accounts[0], nameHash)
    assert.strictEqual(isOwnerTrue, true)
    const isOwnerFalse = await trustBase.isOwner(accounts[1], nameHash)
    assert.strictEqual(isOwnerFalse, false)
  })
})

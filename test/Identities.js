const expectThrow = require('./utils').expectThrow
const Identities = artifacts.require('Identities')

const bytes20Zero = '0x0000000000000000000000000000000000000000'
const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

contract('Identities', (accounts) => {
  let identities
  const usernameHash = web3.sha3('ceoimon')
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  beforeEach(async () => {
    identities = await Identities.new()
  })

  it('register: should succeed in registration for a unregistered name', async () => {
    await identities.register(usernameHash, _publicKey, { from: accounts[0] })
  })

  it('register: should fail in registration for a registered name', async () => {
    await identities.register(usernameHash, _publicKey, { from: accounts[0] })
    await expectThrow(identities.register(usernameHash, _publicKey, { from: accounts[0] }))
  })

  it('getIdentity: should return identity of a registered name', async () => {
    await identities.register(usernameHash, _publicKey, { from: accounts[0] })
    const [
      owner,
      publicKey
    ] = await identities.getIdentity(usernameHash)
    assert.strictEqual(owner, accounts[0])
    assert.strictEqual(publicKey, _publicKey)
  })

  it('getIdentity: should return zero-values for a unregistered name', async () => {
    const [
      owner,
      publicKey
    ] = await identities.getIdentity(web3.sha3('howard'))
    assert.strictEqual(owner, bytes20Zero)
    assert.strictEqual(publicKey, bytes32Zero)
  })

  it('isOwner: should return correct result', async () => {
    await identities.register(usernameHash, _publicKey, { from: accounts[0] })
    const isOwnerTrue = await identities.isOwner(usernameHash, accounts[0])
    assert.strictEqual(isOwnerTrue, true)
    const isOwnerFalse = await identities.isOwner(usernameHash, accounts[1])
    assert.strictEqual(isOwnerFalse, false)
    const isOwnerFalse2 = await identities.isOwner(web3.sha3('howard'), accounts[0])
    assert.strictEqual(isOwnerFalse2, false)
  })
})

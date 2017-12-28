const expectThrow = require('./utils').expectThrow
const Identities = artifacts.require('Identities')

const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

contract('Identities', (accounts) => {
  let identities
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  beforeEach(async () => {
    identities = await Identities.new()
  })

  it('register: should succeed in registration for a unregistered address', async () => {
    await identities.register(_publicKey, { from: accounts[0] })
  })

  it('register: should fail in registration for a registered address', async () => {
    await identities.register(_publicKey, { from: accounts[0] })
    await expectThrow(identities.register(_publicKey, { from: accounts[0] }))
  })

  it('getIdentity: should return identity of a registered address', async () => {
    await identities.register(_publicKey, { from: accounts[0] })
    const [
      publicKey
    ] = await identities.getIdentity(accounts[0])
    assert.strictEqual(publicKey, _publicKey)
  })

  it('getIdentity: should return zero-values for a unregistered address', async () => {
    const [
      publicKey
    ] = await identities.getIdentity(accounts[1])
    assert.strictEqual(publicKey, bytes32Zero)
  })
})

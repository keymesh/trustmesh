const expectThrow = require('./utils').expectThrow
const Trustbase = artifacts.require('Trustbase')
const PreKeyStore = artifacts.require('PreKeyStore')

const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

contract('PreKeyStore', (accounts) => {
  const today = Math.floor(new Date().getTime() / 1000 / 3600 / 24)
  const nameHash = web3.sha3('ceoimon')
  const nameHash2 = web3.sha3('howard')
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  const _publicKey2 = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34507'
  const _prekeys = [
    '0x81334c1b677d64a5af480ed226b1671d6bd8c5b10b0f6d5f31b660a61cdeeb26',
    '0x52f0612dbf92dd3d420b95cce611a6a7a84656754914912a98bb87c0d225a71e',
    '0x7f9d05596f10fdd6d41a3762248f61e94de6bb14ed8a3e405c44be2f4cafdead',
    '0x6028cfdd1d88e3e33ef8f428a0d02ba51ae821140a14551f3d12ef34fb91f5f2',
    '0xf693d2cbaaa76b3cce4598db10485995c0bbcacbe40eaf0a3c5718b07b267a57',
    '0x538bc75e481fd6573669ed54300c6f09d4f3c16ef83ec6cc5fa7057a499074ed',
    '0x87bd42eaacecfa294cd2fd744b4bcee692e077a1e4d49d175e64f9cddc2a05e8',
    '0x5b1889714730d3125f3cef1cf681fe4d9969e2afebc62eb315e3ed6de43aeb5b',
    '0x1e5a708199b38353ee4e68c4d2aeca321fdd2f6a65bb38be0ac0ed9824a54e4b',
    '0xdcd56d2112295b68fcf57bf2c5ac097cec239011086c3f77fc62731353b0dbe1'
  ]

  it('should add prekeys successfully', async () => {
    const trustbase = await Trustbase.new()
    await trustbase.register(nameHash, _publicKey, { from: accounts[0] })
    const prekeyStore = await PreKeyStore.new(trustbase.address)

    await prekeyStore.addPrekeys(nameHash, _prekeys, today, 1, { from: accounts[0] })

    const prekeys = await Promise.all(_prekeys
      .map((_, i) => prekeyStore.getPrekey(
        nameHash,
        today + i
      )))
    prekeys.forEach((prekey, i) => {
      assert.strictEqual(prekey, _prekeys[i])
    })
  })

  it('should fail when trying to add prekeys by person who is not the owner', async () => {
    const trustbase = await Trustbase.new()
    await trustbase.register(nameHash, _publicKey, { from: accounts[0] })
    await trustbase.register(nameHash2, _publicKey2, { from: accounts[1] })
    const prekeyStore = await PreKeyStore.new(trustbase.address)

    const now = new Date()
    const timestampOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime() / 1000

    expectThrow(prekeyStore.addPrekeys(
      nameHash,
      _prekeys,
      timestampOfDay,
      1,
      { from: accounts[1] }
    ))
  })

  it('should delete old prekeys when trying to replace prekeys', async () => {
    const trustbase = await Trustbase.new()
    await trustbase.register(nameHash, _publicKey, { from: accounts[0] })
    const prekeyStore = await PreKeyStore.new(trustbase.address)

    // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    await prekeyStore.addPrekeys(
      nameHash,
      _prekeys,
      today,
      1,
      { from: accounts[0] }
    )

    // [0, 1, 2, 5, _, 6, _, 7, _, 8, _, 9]
    await prekeyStore.addPrekeys(
      nameHash,
      _prekeys.slice(5),
      today + 3,
      2,
      { from: accounts[0] }
    )

    const _newPrekeys = _prekeys.slice(5).reduce((r, prekey, i) => {
      if (i === 0) return r.concat(prekey)
      return r.concat([bytes32Zero, prekey])
    }, _prekeys.slice(0, 3))

    const prekeys = await Promise.all(_newPrekeys
      .map((_, i) => prekeyStore.getPrekey(
        nameHash,
        today + i
      )))
    prekeys.forEach((prekey, i) => {
      assert.strictEqual(prekey, _newPrekeys[i])
    })
  })
})

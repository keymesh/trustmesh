const Trustbase = artifacts.require('Trustbase')
const Messages = artifacts.require('Messages')

contract('Messages', (accounts) => {
  const nameHash = web3.sha3('ceoimon')
  const _publicKey = '0x4f03aecc73addb254c219b054b1b08418d7d9af5af663ffaaa38c07f30f34506'
  const message = '0xa3000101a1005820ef54869cd83ac62c9fa21c7942a81e5e82b016ef05b327d2a8574138bd03b2410258a702a40019443301a10058202ce7eee07c1a45e6b9e87cbbaefe4f252935a853cf0cd86c28bb4b52cf86508202a100a10058207f81e57a7ee4c1920144aae403b6079423ec81805a78c64ffd7128e9fff9ff9103a50050becc951b326066af3414e52dfb705f570100020003a10058202f1c035f7428aedd4d240723f877121cf20190032f9288d0211ae8d41d1019b404567d68bdc0771aea7e2db5837b20fbdf4f2ada8b33faa5'
  it('publish: should publish message successfully', async () => {
    const trustbase = await Trustbase.new()
    await trustbase.register(nameHash, _publicKey, { from: accounts[0] })

    const messages = await Messages.new(trustbase.address)
    const publishEvent = messages.Publish()
    await new Promise((resolve) => {
      publishEvent.get((err, logs) => {
        assert.strictEqual(logs.length, 0)
        resolve()
      })
    })

    let publishCounter = 0
    const watchPromise = new Promise((resolve) => {
      publishEvent.watch((_, log) => {
        assert.strictEqual(log.event, 'Publish')
        assert.strictEqual(log.args.message, message)
        publishCounter += 1
        resolve()
      })
    })
    await messages.publish('proteus', nameHash, message, { from: accounts[0] }).then((result) => {
      const logs = result.logs
      assert.strictEqual(logs.length, 1)
      assert.strictEqual(logs[0].event, 'Publish')
      assert.strictEqual(logs[0].args.message, message)
    })
    await watchPromise
    assert.strictEqual(publishCounter, 1)

    await new Promise((resolve) => {
      publishEvent.get((err, logs) => {
        assert.strictEqual(logs.length, 1)
        resolve()
      })
    })

    publishEvent.stopWatching()
  })
})


const Cryptobox = require('wire-webapp-cryptobox')
const Proteus = require('wire-webapp-proteus')
const sodium = require('libsodium-wrappers-sumo')
const ed2curve = require('ed2curve')

const trustbase = require('../src')

const PreKey = Proteus.keys.PreKey

class MyCacheStore extends Cryptobox.store.Cache {
  // eslint-disable-next-line
  delete_prekey() {}
}

class MyPreKeyBundle extends Proteus.keys.PreKeyBundle {
  static new(publicIdentityKey, prekeyPublicKey, keyID) {
    const bundle = super.new(publicIdentityKey, PreKey.new(keyID))

    bundle.public_key = prekeyPublicKey

    return bundle
  }
}

function generatePrekeys(start, interval, size) {
  if (size === 0) {
    return []
  }

  return [...Array(size).keys()]
    .map(x => PreKey.new(((start + (x * interval)) % PreKey.MAX_PREKEY_ID)))
}

function unixToday() {
  return Math.floor(new Date().getTime() / 1000 / 3600 / 24)
}

trustbase.setup()
  .then(async ({
    web3,
    getContractInstance
  }) => {
    const trustbaseInstance = await trustbase.TrustBase.getInstance(getContractInstance, web3)
    const prekeyStoreInstance = await trustbase.PrekeyStore.getInstance(getContractInstance, web3)
    async function newPerson(name) {
      const keyPair = Proteus.keys.IdentityKeyPair.new()

      const today = unixToday()
      const interval = 1
      const prekeys = generatePrekeys(today, interval, 100)
      const prekeysPublicKeys = []

      prekeys.forEach((prekey) => {
        prekeysPublicKeys.push(`0x${prekey.key_pair.public_key.fingerprint()}`)
      })

      await trustbaseInstance.register(
        name,
        keyPair.public_key.fingerprint()
      )

      await prekeyStoreInstance.uploadPrekeys(
        name,
        prekeysPublicKeys,
        {
          interval,
          fromUnixDay: today
        }
      )
      const lastResortPrekey = PreKey.last_resort() // key_id is 65535
      lastResortPrekey.key_pair = prekeys[prekeys.length - 1].key_pair
      const store = new MyCacheStore()
      await store.save_identity(keyPair)
      await store.save_prekeys(prekeys.concat(lastResortPrekey))
      const box = new Cryptobox.Cryptobox(store, 0)

      await box.load()

      return {
        box,
        store
      }
    }

    const BOB_NAME = `bob${Math.random()}`
    const ALICE_NAME = `alice${Math.random()}`
    const bob = await newPerson(BOB_NAME)
    const alice = await newPerson(ALICE_NAME)

    // get a prekey bundle from blockchain
    const bobIdentityKeyString = await trustbaseInstance.getIdentity(BOB_NAME)
    const {
      interval,
      lastPrekeysDate
    } = await prekeyStoreInstance.getMetaData(BOB_NAME)
    const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'
    let prekeyPublicKeyString = bytes32Zero
    let prekeyID = unixToday()
    if (prekeyID > lastPrekeysDate) {
      prekeyPublicKeyString = await prekeyStoreInstance.getPrekey(BOB_NAME, 65535)
      prekeyID = 65535
    } else {
      const limitDay = prekeyID - interval
      while (prekeyID > limitDay && prekeyPublicKeyString === bytes32Zero) {
        // eslint-disable-next-line
        prekeyPublicKeyString = await prekeyStoreInstance.getPrekey(BOB_NAME, prekeyID)
        prekeyID -= 1
      }
      prekeyID += 1

      // If not found, use last-resort prekey
      if (prekeyPublicKeyString === bytes32Zero) {
        prekeyPublicKeyString = await prekeyStoreInstance.getPrekey(BOB_NAME, 65535)
        prekeyID = 65535
      }
    }

    const prekeyPublicKeyEd = sodium.from_hex(prekeyPublicKeyString.slice(2))
    const prekeyPublicKeyCurve = ed2curve.convertPublicKey(prekeyPublicKeyEd)
    const prekeyPublicKey = Proteus.keys.PublicKey.new(
      prekeyPublicKeyEd,
      prekeyPublicKeyCurve
    )

    const bobIdentityKeyEd = sodium.from_hex(bobIdentityKeyString.slice(2))
    const bobIdentityKeyCurve = ed2curve.convertPublicKey(bobIdentityKeyEd)
    const bobIdentityKey = Proteus.keys.IdentityKey.new(Proteus.keys.PublicKey.new(
      bobIdentityKeyEd,
      bobIdentityKeyCurve
    ))

    const prekeyBundleOfBob = MyPreKeyBundle.new(bobIdentityKey, prekeyPublicKey, prekeyID)
    // ----------

    const aliceSession = await alice.box.session_from_prekey(
      ALICE_NAME,
      prekeyBundleOfBob.serialise()
    )
    const messageByAlice = await aliceSession.encrypt('Hello Bob, I am Alice.')
    const [
      bobSession,
      messageFromAlice
    ] = await bob.box.session_from_message(BOB_NAME, messageByAlice)

    console.log(sodium.to_string(messageFromAlice))

    const messageByBob = await bobSession.encrypt('Hello Alice, I am Bob.')
    const messageFromBob = await aliceSession.decrypt(messageByBob)

    console.log(sodium.to_string(messageFromBob))
  })
  .catch((err) => {
    console.log(err)
  })

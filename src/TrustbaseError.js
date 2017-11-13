class TrustbaseError extends Error {
  constructor(message, code = TrustbaseError.CODE.UNKNOWN) {
    super(message)

    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
    this.code = code
  }

  static get CODE() {
    return Object.freeze({
      UNKNOWN: 0,
      UNINITIALIZED_WEB3: 100,
      INITIALIZED_ALREADY: 101,
      PROVIDER_NOT_PROVIDED: 102,
      INVALID_ACCOUNT_ADDRESS: 200,
      ACCOUNT_NOT_EXIST: 201,
      FOUND_NO_ACCOUNT: 202,
      NETWORK_MISMATCH: 300,
      INVALID_CONTRACT_ADDRESS: 301
    })
  }
}

module.exports = TrustbaseError

const path = require('path')
const os = require('os')

module.exports = {
  IS_DEV: process.env.NODE_ENV === 'development',
  RECORD_PATH: path.resolve(os.homedir(), '.trustbase/idents/.pending')
}

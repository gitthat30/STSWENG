const bcrpyt = require('bcrypt');

saltround = 10

const functions = {
  hash: async function(password) {
    salt = await bcrpyt.genSalt(saltround)

    hash = await bcrpyt.hash(password, salt)

    return hash
  },

  compare: async function(encrpyted, hash) {
    result = await bcrpyt.compare(encrpyted, hash)

    return result
  }
}

module.exports = functions;
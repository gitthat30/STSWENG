const bcrypt = require('../util/bcrypt.js');
const db = require('../models/db.js');
const account = require('../models/Accounts.js');

saltround = 10

const functions = {
  changePass: async function(password, username) {
    hashed = await bcrypt.hash(password)
    
    await new Promise ((resolve) => {
      db.updateOne(account, {username: username}, {password: hashed}, (result) => {
        console.log("Hello");
        console.log(result)
        resolve(result)
      })
    })
  }
}

module.exports = functions;
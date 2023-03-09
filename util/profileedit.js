const bcrypt = require('../util/bcrypt.js');
const db = require('../models/db.js');
const account = require('../models/Accounts.js');

saltround = 10

const functions = {
  changePass: async function(password, username) {
    hashed = await bcrypt.hash(password)
    
    await new Promise ((resolve) => {
      db.updateOne(account, {username: username}, {password: hashed}, (result) => {
        resolve(result)
      })
    })
  },

  editProfile: async function(fname, lname, contact, email, username) {
    await console.log("editProfile")
    await console.log(fname)
    await console.log(lname)
    await console.log(contact)
    await console.log(email)
    await console.log(username)
    await new Promise ((resolve) => {
      db.updateOne(account, {username: username}, {fname: fname, lname: lname, contact: contact, email: email}, (result) => {
        console.log("Hello");
        console.log(result)
        resolve(result)
      })
    })
  },
}

module.exports = functions;
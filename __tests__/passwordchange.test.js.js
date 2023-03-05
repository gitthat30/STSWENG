const db = require('../models/db.js');
const account = require('../models/Accounts.js');
const bcrypt = require('../util/bcrypt')
const passwordchange = require('../util/passwordchange')
const mongoose = require('mongoose');

test('Function properly changes password', async () => {
  db.connect()
  testuser = "testing"

  await new Promise ( (resolve) => {
    db.insertOne(account, {
    username: testuser,
    password: "Default"
    }, (result) => {resolve(result)})
  })

  await passwordchange.changePass("newpass", testuser)

  await db.findOne(account, {username: testuser}, {}, async (result) => {
    equal = await bcrypt.compare("newpass", result.password)
    await expect(equal).toBe(true)
  })


  await new Promise ( (resolve) => {
    db.deleteOne(account, {username: testuser}, (result) => {resolve(result)})
  })

  await db.disconnect()
})
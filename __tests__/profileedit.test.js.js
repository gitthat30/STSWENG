const db = require('../models/db.js');
const account = require('../models/Accounts.js');
const bcrypt = require('../util/bcrypt')
const profile = require('../util/profileedit')
const mongoose = require('mongoose');

beforeAll(async () => {
  await db.connect()
  
  testuser = "testing"

  await new Promise ( (resolve) => {
    db.insertOne(account, {
      username: testuser,
      password: "Default",
      fname: "First",
      lname: "Last",
      contact: "123",
      email: "t@a"
    }, (result) => {resolve(result)})
  })

  //Change Password
  await profile.changePass("newpass", testuser)
  await console.log("here")

  //Change Profile Fields
  await profile.editProfile("nFirst", "nLast", "n123", "a@t", testuser)
  await console.log("here2")
})

test('changePass properly changes password', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      console.log(result)
      equal = bcrypt.compare("newpass", result.password)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes first name', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      console.log(result)
      equal = ("nFirst" == result.fname)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes first name', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      console.log(result)
      equal = ("nFirst" == result.fname)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes last name', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      console.log(result)
      equal = ("nLast" == result.lname)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes contact number', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      console.log(result)
      equal = ("n123" == result.contact)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes email', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      console.log(result)
      equal = ("a@t" == result.email)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

afterAll(async () => {
  await new Promise ( (resolve) => {
    db.deleteOne(account, {username: "testing"}, (result) => {resolve(result)})
  })

  await db.disconnect()
})


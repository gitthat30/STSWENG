const db = require('../models/db.js');
const account = require('../models/Accounts.js');
const bcrypt = require('../util/bcrypt')
const profile = require('../util/profileedit')
const mongoose = require('mongoose');
jest.setTimeout(50000)
beforeAll(async () => {
  await db.connect()
  
  testuser = "testing"

  questions = []

  questions.push (
    {
      question: '1',
      answer: 'a1'
    }
  )

  questions.push (
    {
      question: '2',
      answer: 'a2'
    }
  )
  
  questions.push (
    {
      question: '3',
      answer: 'a3'
    }
  )

  questions.push (
    {
      question: '4',
      answer: 'a4'
    }
  )

  await new Promise ( (resolve) => {
    db.insertOne(account, {
      username: testuser,
      password: "Default",
      fname: "First",
      lname: "Last",
      contact: "123",
      questions: questions,
      email: "t@a"
    }, (result) => {resolve(result)})
  })

  //Change Password
  await profile.changePass("newpass", testuser)

  //Change Profile Fields
  await profile.editProfile("nFirst", "nLast", "n123", "a@t", testuser)

  //Change Security Questions
  await profile.editQuestions("4", "3", "2", "1", "a4", "a3", "a2", "a1", testuser)
})

test('changePass properly changes password', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = bcrypt.compare("newpass", result.password)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes first name', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("nFirst" == result.fname)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes first name', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("nFirst" == result.fname)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes last name', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("nLast" == result.lname)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes contact number', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("n123" == result.contact)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editProfile properly changes email', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("a@t" == result.email)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editQuestion properly changes question 1', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("4" == result.questions[0].question)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editQuestion properly changes question 2', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("3" == result.questions[1].question)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})


test('editQuestion properly changes question 3', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("2" == result.questions[2].question)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editQuestion properly changes question 4', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("1" == result.questions[3].question)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editQuestion properly changes answer 1', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("a4" == result.questions[0].answer)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editQuestion properly changes answer 2', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("a3" == result.questions[1].answer)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})


test('editQuestion properly changes answer 3', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("a2" == result.questions[2].answer)
      resolve(equal)
    })
  })

  expect(test).toBe(true)
})

test('editQuestion properly changes answer 4', async () => {
  test = await new Promise ((resolve) => {
    db.findOne(account, {username: "testing"}, {}, (result) => {
      equal = ("a1" == result.questions[3].answer)
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


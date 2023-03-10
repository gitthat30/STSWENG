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
    await new Promise ((resolve) => {
      db.updateOne(account, {username: username}, {fname: fname, lname: lname, contact: contact, email: email}, (result) => {
        resolve(result)
      })
    })
  },

  editQuestions: async function(q1, q2, q3, q4, a1, a2, a3, a4, username) {
    console.log("Edit Questions")
    questions = await new Promise ((resolve) => {
      questions = []
      
      questions.push (
        {
          question: q1,
          answer: a1
        }
      )

      questions.push (
        {
          question: q2,
          answer: a2
        }
      )
      
      questions.push (
        {
          question: q3,
          answer: a3
        }
      )

      if(q4) {
        questions.push (
          {
            question: q4,
            answer: a4
          }
        )
      }

      resolve(questions)
    })

    await new Promise ((resolve) => {
      db.updateOne(account, {username: username}, {questions:questions}, (result) => {
        resolve(result)
      })
    })
  },
}

module.exports = functions;
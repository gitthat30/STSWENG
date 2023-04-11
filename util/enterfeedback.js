const db = require('../models/db.js');
const feedback = require('../models/Feedback.js');

const functions = {
    enterFeedback: async function(userFeedback, username, id){

        await new Promise ((resolve) => {
            var newFeedback = {
                Request_id: id,
                username: username,
                feedback: userFeedback
            }
            db.insertOne(feedback, newFeedback, (result) =>{
                resolve(result)
            } )
        })
    }
}

module.exports = functions
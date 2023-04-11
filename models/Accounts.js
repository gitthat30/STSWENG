var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    username: String,
    password: String,
    contact: String,
    host: Boolean,
    pos: String,
    email: String,
    questions: [{
        question: String,
        answer: String
    }],
    answer: String,
    notifications: [{
        message: String,
        read: Boolean,
        sentdate: String,
        reqid: String  
    }],
    registerdate: String
});

module.exports = mongoose.model('Account', AccountSchema);

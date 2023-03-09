var mongoose = require('mongoose');

var FeedBackSchema = new mongoose.Schema({
    username: String,
    feedback: String
});

module.exports = mongoose.model('Feedback', FeedBackSchema);
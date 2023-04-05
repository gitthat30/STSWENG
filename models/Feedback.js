var mongoose = require('mongoose');

var FeedBackSchema = new mongoose.Schema({
    Request_id: String,
    username: String,
    feedback: String
});

module.exports = mongoose.model('Feedback', FeedBackSchema);
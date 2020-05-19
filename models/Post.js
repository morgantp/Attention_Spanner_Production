const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({  
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    username: {
        type: String
    },
    title: {
        type: String
    },
    body: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }       
    }]
});

module.exports = Post = mongoose.model('post', PostSchema);
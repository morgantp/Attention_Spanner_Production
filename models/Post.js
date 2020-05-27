const mongoose = require('mongoose');

// model for Posts takes in userid so I can i display user specific posts on the account page. Also takes in username so it can 
// display the user who posted the post in the physical post
// also sets up a like array which stores likes
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
// requires all the necessary packages
var express = require('express');
var app = express();
var handlebars = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');

require('./middleware/passport')(passport);

const { isAuth } = require('./middleware/isAuth');

const User = require('./models/User');
const Post = require('./models/Post');

const port = process.env.PORT || 3000;
const mongoURL = process.env.mongoURL || 'mongodb://localhost:27017/handlebars';

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}))

app.use(express.static('public'));
app.use(
    session({
        secret: 'mySecret',
        resave: true,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// gets my login page renders login.hbs with start.hbs as its layout
app.get('/', (req, res) => {
    try {
        res.render('login', { layout: 'start' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

// renders my cogfeed page using cogfeed.hbs with cogpage,hbs as its layout. isAuth also makes sure only people who are logged in can 
// access the page
app.get ('/cogfeed', isAuth, (req, res) => {
    try {
        // finds posts to populate the page and sorts the so most recent show on top
        Post.find({}).lean().sort({date: -1}).exec((err, posts) => {
            if (posts.length) {
                // ensures the page renders the same if there are posts or not also requires the username so it can used in a welcome message
        res.render('cogfeed' , { layout: 'cogpage', posts: posts, postsExist: true, username: req.user.username });  
    } else {
        res.render('cogfeed' , { layout: 'cogpage', posts: posts, postsExist: false, username: req.user.username });  
    }
    });
} catch(err) {
    console.log(err.message);
    res.status(500).send('server error')
    }
})
// same principle for the account page
app.get ('/account', isAuth, (req, res) => {
    try {
        Post.find({ user: req.user.id }).lean().sort({date: -1}).exec((err, posts) => {
            if (posts.length) {
        res.render('account' , { layout: 'accountpage', posts: posts, postsExist: true, username: req.user.username });  
    } else {
        res.render('account' , { layout: 'accountpage', posts: posts, postsExist: false, username: req.user.username });  
    }
    });
} catch(err) {
    console.log(err.message);
    res.status(500).send('server error')
    }
})
// same principle but im not requiring to look for posts on this page
app.get ('/workbench', isAuth, (req, res) => {
    try {
        res.render('workbench' , { layout: 'workpage', username: req.user.username });
    } catch(err) {
    console.log(err.message);
    res.status(500).send('server error')
    }
})
// posts the signups to the database
app.post('/signup', async (req, res) =>{
    const { email, username, password } = req.body;
    try {
        // searches for an existing username to see if the username is taken and then refers to an if statement to write a success and failure
        // message in both cases
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).render('login', {layout: 'start', userExist: true});
        }
        user = new User({
            email,
            username,
            password
        });
        // salts the password 10 times
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();
        return res.status(200).render('login', {layout: 'start', userDoesNotExist: true});
    } catch (err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }  
})

// signin request if the sign in its authenticated by my passport.js it will redirect to the cogfeed app.get if it is unsuccessful 
// it writes /?unsuccessful in the task bar
app.post('/signin', (req, res, next) => {
    try{
        passport.authenticate('local', {
            successRedirect: '/cogfeed',
            failureRedirect: '/?unsuccessful'
        })(req, res, next);
    } catch (err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})
// app.post which sends the posts to the database
app.post('/addPost', (req, res) => {
    const {title, body} = req.body;
    try {
        let post = new Post({
            user: req.user.id,
            username: req.user.username,
            title,
            body
        });

        post.save()
        res.redirect('/cogfeed');
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})
// app.post that sends my likes to the database
app.post('/likes/:id', async (req, res) => {
    try {
        //console.log(req.params.id)
        // attempted to use findOneAndUpdate to look in the like array for a matching userId so a user would only be able to like a post once
        // however it didn't work
        await Post.findOneAndUpdate({_id: req.params.id }, {
           $addToSet: {
              likes: mongoose.Types.ObjectId(req.user.id)
           }
        });
        // 
        res.redirect('/cogfeed');
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})
// signs the user out and redirects them to the login page
app.get('/signout', (req, res) => {
    req.logout();
    res.redirect('/');
})
    
mongoose.connect(mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to DB');
})
.catch((err) => {
    console.log('Not Connected to the DB with err : ' +err);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
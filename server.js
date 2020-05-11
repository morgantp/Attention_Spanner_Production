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

app.get('/', (req, res) => {
    try {
        res.render('login', { layout: 'start' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

app.get ('/cogfeed', isAuth, (req, res) => {
    try {
        Post.find({}).lean().exec((err, posts) => {
            if (posts.length) {
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

app.get ('/account', isAuth, (req, res) => {
    try {
        Post.find({ user: req.user.id }).lean().exec((err, posts) => {
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

app.get ('/workbench', isAuth, (req, res) => {
    try {
        res.render('workbench' , { layout: 'workpage', username: req.user.username });
    } catch(err) {
    console.log(err.message);
    res.status(500).send('server error')
    }
})

app.post('/signup', async (req, res) =>{
    const { email, username, password } = req.body;
    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).render('login', {layout: 'start', userExist: true});
        }
        user = new User({
            email,
            username,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();
        return res.status(200).render('login', {layout: 'start', userDoesNotExist: true});
    } catch (err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }  
})


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

app.post('/addPost', (req, res) => {
    const {title, body} = req.body;
    try {
        let post = new Post({
            user: req.user.id,
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
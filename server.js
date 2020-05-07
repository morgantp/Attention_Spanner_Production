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

const User = require('./models/User.js');

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
        cookie: { maxAge: 60000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    try {
        res.render('login', { layout: 'main' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

app.get ('/cogfeed', (req, res) => {
    try {
        res.render('cogfeed' , { layout: 'mainpage', username: req.user.username });
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
            return res.status(400).render('login', {layout: 'main', userExist: true});
        }
        user = new User({
            email,
            username,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();
        return res.status(200).render('login', {layout: 'main', userDoesNotExist: true});
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
    console.log(`Server listening on port ${3000}`);
});
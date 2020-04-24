var express = require('express');
var app = express();
var handlebars = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

var Contact = require('./models/Contact');
var User = require('./models/User');

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}))

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get ('/', (req, res) =>{
    res.render('login', { layout: 'main' });
})

app.get('/', (req, res) => {
    Contact.find({}).lean()
        .exec((err, contacts) =>{
            if(contacts.length){
            res.render('dashboard', { layout: 'main', contacts: contacts, contactsExist: true }); 
            }else{
            res.render('dashboard', { layout: 'main', contacts: contacts, contactsExist: false });
            }
        })
});

app.post('/signup', async (req, res) =>{
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).render('login', {layout: 'main', userExist: true});
        }
        user = new User({
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

app.post('/signin', (req, res) =>{
    const { username, password } = req.body;
    var contact = new Contact({
        username,
        password,
    });
    user.save();
    res.redirect('/');
})

mongoose.connect('mongodb://localhost:27017/handlebars',{
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to DB');
})
.catch((err) => {
    console.log('Not Connected to the DB with err : ' +err);
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
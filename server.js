const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
// ...rest of the initial code omitted for simplicity.
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');

const config = require('./config/database');

//connect to mongodb
mongoose.connect( config.database , config.options );
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to Mongodb')
})

const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder
app.use(express.static( path.join(__dirname, 'public') ));

//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  // cookie: { secure: true }
  })
);

//set global errors variable
app.locals.errors = null;

// get page model
let pageSchema = require('./models/pageModel')

// get all pages to pass to header.ejs
pageSchema.find( {} ).sort( {sorting: 1} ).exec()
.then( page => {
    app.locals.pages = page;
});

// get category model
let categorySchema = require('./models/categoryModel');

// get all categories to pass to header.ejs
categorySchema.find( {} ).exec()
.then( cat => {
    app.locals.categories = cat;
});

// express fileUpload middleware
app.use(fileUpload());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//express-validator
app.use(expressValidator({
  customValidators: {
    isImage: (value, filename) => {
      let extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        // case '.gif':
        //   return '.gif';
        case '':
          return '.jpg';      
        default:
          return false;
        }
    }
  }
}));

// caching disabled for every route // back button issue resolve
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

//express-message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
})

const pages = require('./routes/pageRouter');
const products = require('./routes/productRouter');
const cart = require('./routes/cartRouter');
const User = require('./routes/userRouter');

const adminPages = require('./routes/adminPageRouter');
const adminCategories = require('./routes/adminCategoryRouter');
const adminProducts = require('./routes/adminProductRouter');

app.use('/', pages);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', User);

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);


app.listen(config.port, () => {
    console.log(`server is running on http://localhost:${config.port}`)
})
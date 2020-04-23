const express = require('express');
let passport = require('passport');
let bcrypt = require('bcryptjs');
const router = express.Router();

let UserSchema = require('../models/userModel');

// get register
router.get('/register', (req, res) => {

    res.render('register', {
        title: 'Register',
    })     
});

// post register
router.post('/register', (req, res) => {

    let name = req.body.name;
    let email = req.body.email;   
    let username = req.body.username;   
    let password = req.body.password;   

    UserSchema.findOne({username: username}).exec()
    .then( user => {
        if(user) {
            req.flash('danger', 'Username exists, choose another');
            res.redirect('/users/register');
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    UserSchema.create({
                        name: name,
                        email: email,
                        username: username,
                        password: hash,
                        admin: 0
                    })
                    .then(user => {
                        req.flash('success', 'You are now registered');
                        res.redirect('/users/login');
                    })
                })
            })
            
        }
    })

});

// get login
router.get('/login', (req, res) => {

    if(res.locals.user){ 
        res.redirect('/');
    } else {
        res.render('login', {
            title: 'Login',
        })  
    }
    
});

// post login
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
});

// get logout
router.get('/logout', (req, res) => {

    req.logout();

    req.flash('success', 'You are logged out :(');
    res.redirect('/users/login');
    
});

module.exports = router;
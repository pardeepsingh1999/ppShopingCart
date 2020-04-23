const express = require('express');

const router = express.Router();

let pageSchema = require('../models/pageModel')
// get /
router.get('/', (req, res) => {

    pageSchema.findOne({slug: 'home'}).exec()
    .then( page => {
        if(page) {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
        if(!page) { 
            res.render('index', {
                title: 'Home',
                content: 'Make Home page/slug'
            });
        }
    })
    
})

// get a page
router.get('/:slug', (req, res) => {

    let slug = req.params.slug;

    pageSchema.findOne( {slug: slug} ).exec()
    .then( page => {
        if(!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                    title: page.title,
                    content: page.content
                });
        }
    })
    
})

module.exports = router;
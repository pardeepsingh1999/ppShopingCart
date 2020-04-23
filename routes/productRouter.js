const express = require('express');
const fse = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser;

const router = express.Router();

let productSchema = require('../models/productModel');
let categorySchema = require('../models/categoryModel');

// get /
router.get('/all-product', (req, res) => {
// router.get('/all-product', isUser, (req, res) => {


    productSchema.find().exec()
    .then( pro => { 
                    res.render('all_product', {
                        title: 'All products',
                        products: pro
                    });
    });
    
});

// get product by categories
router.get('/:category', (req, res) => {

    let categorySlug = req.params.category;

    categorySchema.findOne( { slug: categorySlug } ).exec()
    .then( cat => {
        productSchema.find( { category: categorySlug } ).exec()
        .then( pro => {
            res.render('all_product', {
                title: cat.title,
                products: pro
            });
        })  
    }); 
});

// get product detail
router.get('/:category/:id', (req, res) => {

    let galleryImages = null;

    let categorySlug = req.params.category;
    let id = req.params.id;
    let loggedIn = (req.isAuthenticated()) ? true : false;

    productSchema.findById( id ).exec()
    .then( pro => {
        // let galleryDir = `public/product_images/${pro._id}/gallery`;

        fse.readdir(`public/product_images/${pro._id}/gallery`, (err, files) => {
            if(err)
                console.log(err)    
            galleryImages = files;

            // console.log(galleryImages)

            res.render('product_detail', {
                title: pro.title,
                pro: pro,
                galleryImages: galleryImages,
                loggedIn: loggedIn
            });
        })
    });  
});

module.exports = router;
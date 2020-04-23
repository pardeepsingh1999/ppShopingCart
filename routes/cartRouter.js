let express = require('express');
let router = express.Router();

let productSchema = require('../models/productModel');

const auth = require('../config/auth');
const isUser = auth.isUser;

// get add to cart
router.get('/add/:id', isUser, (req, res) => {
    let id = req.params.id;

    productSchema.findById( id ).exec()
    .then(pro => {
        if(typeof req.session.cart == 'undefined'){
            req.session.cart = [];
            req.session.cart.push({
                proId: id,
                cat: pro.category,
                title: pro.slug,
                qty: 1,
                price: parseFloat(pro.price).toFixed(2),
                image: '/product_images/' + pro.id +'/'+ pro.productImage
            })
        } else {
            let cart = req.session.cart;
            let newItem = true;

            for(var i = 0; i < cart.length; i++){
                if(cart[i].title == pro.slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if(newItem){
                cart.push({
                    proId: id,
                    cat: pro.category,
                    title: pro.slug,
                    qty: 1,
                    price: parseFloat(pro.price).toFixed(2),
                    image: '/product_images/' + pro.id + '/' + pro.productImage
                })
            }
        }
        // console.log(req.session.cart);
        req.flash('success', 'Product added to cart');
        res.redirect('back')
    })
});

// get checkout page
router.get('/checkout', isUser, (req, res) => {

    if(req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout')
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});

// get update product
router.get('/update/:id', isUser, (req, res) => {

    let id = req.params.id;
    let cart = req.session.cart;
    let action = req.query.action;

    for(let i = 0; i < cart.length; i++){
        if(cart[i].proId == id){
            switch (action) {
                case 'add':
                    cart[i].qty++;
                    break;
                case 'remove':
                    cart[i].qty--;
                    if(cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case 'clear':
                    cart.splice(i, 1);
                    if(cart.length == 0) delete req.session.cart;
                    break;
                default:
                    console.log('Update problem');
                    break;
            }
            break;
        }
    }
    // req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});

// get clear cart 
router.get('/clear', isUser,(req, res) => {

    delete req.session.cart;
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});

// get buy now 
router.get('/buynow', isUser, (req, res) => {

    console.log(req.session.cart, req.user)

    delete req.session.cart;

    res.sendStatus(200)
});

module.exports = router;
let express = require('express');
let router = express.Router();
let path = require('path');
let mkdirp = require('mkdirp');
let fse = require('fs-extra');
let resizeImg = require('resize-img');
// let multer = require('multer');

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// product model
let productSchema = require('../models/productModel');

// category model
let categorySchema = require('../models/categoryModel');

// use express uploader (not multer)
// multer middleware
// let uploadImage = multer({
//   storage: multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, 'public/product_images');
//     },
//     filename: function(req, file, cb) {
//       cb(null, calculate() + '_' + file.originalname);
//     }
//   }),
//   fileFilter: function(req, file, cb) {
//     validateFile( file, cb )
//   }
// });

// var validateFile = function( file, cb ){
//     allowedFileTypes = /jpeg|jpg|png|gif/;
//     const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimeType  = allowedFileTypes.test(file.mimetype);
//     if(extension && mimeType){
//         return cb(null, true);
//     }else{
//         cb("Invalid file type. Only JPEG, PNG and GIF file are allowed.")
//     }
// }
      
// get product index
router.get('/', isAdmin, (req, res) => {

    let count;

    productSchema.countDocuments( (err, c) => {
        count = c;
    })

    // console.log(count)

    productSchema.find().exec()
        .then(products => {
            res.render('admin/adminProduct', {
                products: products,
                count: count

            })
        })
        .catch(err => console.log(err))
});

// get add product
router.get('/add-product', isAdmin, (req, res) => {

    let title = '', description = '', price = '';

    categorySchema.find().exec()
        .then( categories => {
            res.render('admin/add_product', {
                title: title,
                description: description,
                categories: categories,
                price: price
            })
        })
});

// img file upload

// post add product
router.post('/add-product', (req, res) => {

    let imageFile = typeof req.files ? req.files.picture.name : '' ;

    // let dirName = req.file.destination;
    // let imageFolder = dirName.split('/');
    // let imageFile = '/' + imageFolder[1] + '/' + req.file.filename;

    // console.log(imageFile);

    // req.checkBody('title', 'Title must have a value.').notEmpty();
    // req.checkBody('description', 'Description must have a value.').notEmpty();
    // req.checkBody('price', 'Price must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image.').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let description = req.body.description;
    let price = req.body.price;
    let category = req.body.category;

    let price2 = parseFloat(price).toFixed(2);

    let errors = req.validationErrors();

    if(errors) {
        categorySchema.find().exec()
        .then( categories => {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                description: description,
                categories: categories,
                price: price
            })
        })
    } else {
        productSchema.findOne( { slug: slug } ).exec()
            .then( pro => {
                if(pro) {
                    categorySchema.find().exec()
                    .then( categories => {
                        req.flash('danger', 'Product title exist, choose another.');
                        res.render('admin/add_product', {
                            title: title,
                            description: description,
                            categories: categories,
                            price: price
                        })
                    })
                } else {

                    productSchema.create({
                        title: title,
                        slug: slug,
                        description: description,
                        price: price2,
                        category: category,
                        productImage: imageFile
                    })
                    .then( pro => {

                        mkdirp.sync('public/product_images/' + pro.id )
                        
                        if(imageFile) {
                            let imagefile = req.files.picture;
                            let filename = req.files.picture.name;

                            imagefile.mv('public/product_images/' + pro.id + '/' + filename, (err) => console.log('Image upload'))
                        }

                        mkdirp.sync('public/product_images/' + pro.id + '/gallery' )
                        mkdirp.sync('public/product_images/' + pro.id + '/gallery/thumbs' )

                        req.flash('success', 'Product added')
                        res.redirect('/admin/products') 
                    } )
                    .catch( err => console.log(err) );
                    }
                })
                .catch( err => console.log(err) );
        }
    
});

// get edit product
router.get('/edit-product/:id', isAdmin, (req, res) => {
    
    let id = req.params.id;

    categorySchema.find().exec()
        .then( categories => {
            productSchema.findById( id ).exec()
            .then( result => {

                let galleryDir = 'public/product_images/' + result._id + '/gallery';
                let galleryImages = null;

                fse.readdir( galleryDir, (err, files) => {
                    if(err){
                        console.log(err)
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            id: result.id,
                            title: result.title,
                            description: result.description,
                            category: result.category.replace(/\s+/g, '-').toLowerCase(),
                            categories: categories,
                            price: parseFloat(result.price).toFixed(2),
                            productImage: result.productImage,
                            galleryImages: galleryImages
                        })
                    }
                })
           
            })
            
        })
});

//post edit product
router.post('/edit-product/:id', (req, res) => {

    let id = req.params.id;
    let imageFile = (req.files) ? req.files.picture.name : '';

    // let dirName = (req.file) ? req.file.destination : '';
    // let imageFolder = (dirName) ? dirName.split('/') : '';
    // let imageFile = (imageFolder) ? '/' + imageFolder[1] + '/' + req.file.filename : '';

    // req.checkBody('image', 'You must upload an image.').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let description = req.body.description;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;

    let price2 = parseFloat(price).toFixed(2);

    let errors = req.validationErrors();

    if(errors) {
        res.redirect('admin/products/edit-product/'+ id );
    } else {
        productSchema.findOne( { slug: slug, _id:{'$ne':id} } ).exec()
            .then( pro => {
                if(pro) {
                    req.flash('danger', 'Product title exist, choose another.');
                    res.redirect('/admin/products/edit-product/'+id);
                    
                } else {
                    
                    if(imageFile) {
                        productSchema.findByIdAndUpdate( id ,
                            {$set: {
                                title: title,
                                slug: slug,
                                description: description,
                                price: price2,
                                category: category,
                                productImage: imageFile
                            } }).exec()
    
                        .then( pro => {
                            if(imageFile){
                                fse.unlink(`./public/product_images/${pro.id}/${pro.productImage}`, function (err) {
                                    if (err) throw err;
                                    // if no error, file has been deleted successfully
                                    console.log('Product Image deleted!');
                                    }); 
    
                                let imagefile = req.files.picture;
                                let filename = req.files.picture.name;
    
                                imagefile.mv('public/product_images/' + pro.id + '/' + filename, (err) => console.log('Image upload'))
                                
                            }
                            req.flash('success', 'Product updated')
                            res.redirect('/admin/products') 
                        })
    
                    } else {
                        productSchema.findByIdAndUpdate( id ,
                            {$set: {
                                title: title,
                                slug: slug,
                                description: description,
                                price: price2,
                                category: category,
                            } }).exec()
    
                        .then( pro => {
                            req.flash('success', 'Product updated')
                            res.redirect('/admin/products') 
                        })
                    }
                }
            })
            .catch( err => console.log(err) );
        }
});

// post product gallery
router.post('/product-gallery/:id', (req, res) => {

    let id = req.params.id;

    let product_images = req.files.file;
    let filename = req.files.file.name;

    let gallery_path = 'public/product_images/' + id + '/gallery/' + filename;
    // let thumb_path = '/public/product_images/' + id + '/gallery/thumbs/' + filename;

    product_images.mv( gallery_path , (err) => {
        if(err) {
            console.log(err)
        }
        console.log('Gallery uploaded')
        
        resizeImg(fse.readFileSync(gallery_path), {width: 100, height: 100}).then( buf => {
            fse.writeFileSync(`./public/product_images/${id}/gallery/thumbs/${filename}`, buf);
        })
    })

    res.sendStatus(200);

});

// get delete gallery images
router.get('/delete-image/:image', isAdmin, (req, res) => {

    let id = req.query.id;

    let gallery_path = './public/product_images/' + id + '/gallery/' + req.params.image;
    let thumb_path = './public/product_images/' + id + '/gallery/thumbs/' + req.params.image;

    fse.remove( gallery_path, (err) => {
        if(err) {
            console.log(err)
        } else {
            fse.remove( thumb_path, (err) => {
                if(err) {
                    console.log(err)
                } else {
                    req.flash('success', 'Image Deleted')
                    res.redirect('/admin/products/edit-product/' + id ) 
                }
            })
        }
    })
    
});

// get delete product
router.get('/delete-product/:id', isAdmin, (req, res) => {

    productSchema.findByIdAndRemove( req.params.id ).exec()
        .then( result => {
            console.log(result.productImage)
            if(result.productImage) {
                fse.remove(`./public/product_images/${result.id}`, function (err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.log('Product Dir deleted!');
                    }); 
                }
            req.flash('success', 'Product deleted')
            res.redirect('/admin/products')
        })
        .catch( err => console.log(err))
});

module.exports = router;
let express = require('express');

let categorySchema = require('../models/categoryModel');

let router = express.Router();

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

//get category index
router.get('/', isAdmin, (req, res) => {

    categorySchema.find().exec()
    .then( categories => {
        res.render('admin/adminCategory', {
            categories: categories
        })
    })
    .catch( err => console.log(err))
});

//get add category
router.get('/add-category', isAdmin, (req, res) => {
    
    let title = '';
    let slug = '';

    res.render('admin/add_category', {
        title: title,
        slug: slug
    })
});

//post add category
router.post('/add-category', (req, res) => {
    
    req.checkBody('title', 'Title must have a value.').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/add_category', { 
            errors: errors,
            title: title
         });
      } else {
          categorySchema.findOne( {slug: slug} )
          .then( (category) => {
              if(category) {
                  req.flash('danger', 'Category title exists, choose another.');
                  res.render('admin/add_category', {
                      title: title
                  });
              } else {
                  categorySchema.create({
                    title: title,
                    slug: slug
                  })
                  .then( category => {
                                        categorySchema.find( {} ).exec()
                                        .then( cat => {
                                            req.app.locals.categories = cat;
                                        });
                                        req.flash('success', 'Category added')
                                        res.redirect('/admin/categories') 
                  } )
                  .catch( err => console.log(err) );
              }
          })
          .catch( err => console.log(err) );
      }

});

//get edit category
router.get('/edit-category/:id', isAdmin, (req, res) => {
    
    categorySchema.findById( req.params.id ).exec()
    .then( result => {
        res.render('admin/edit_category', {
            title: result.title,
            slug: result.slug,
            id: result._id
        })
    })
    .catch( err => console.log(err))

});

//post edit category
router.post('/edit-category/:id', (req, res) => {
    
    req.checkBody('title', 'Title must have a value.').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    
    let id = req.params.id;

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit_category', { 
            errors: errors,
            title: title,
            id: id
         });
      } else {
          categorySchema.findOne( { slug: slug, _id:{'$ne':id} } )
          .then( (page) => {
              if(page) {
                  req.flash('danger', 'Category title exists, choose another.');
                  res.render('admin/edit_category', {
                      title: title,
                      id: id
                  });
              } else {
                  categorySchema.findByIdAndUpdate( id ,
                    { $set: {
                        title: title
                        } 
                    }, 
                    { new: true }
                    )
                    .then( page => {
                                    categorySchema.find( {} ).exec()
                                    .then( cat => {
                                        req.app.locals.categories = cat;
                                    });
                                    req.flash('success', 'Category updated')                
                                    res.redirect('/admin/categories') } )
                    .catch( err => console.log(err) );
              }
          })
          .catch( err => console.log(err) );
      }

});

//delete page route
router.get('/delete-category/:id', isAdmin, (req, res) => {
    
    const id = req.params.id;
    // console.log(id)
    categorySchema.findByIdAndRemove( id ).exec()
    .then( result => {
                        categorySchema.find( {} ).exec()
                        .then( cat => {
                            req.app.locals.categories = cat;
                        });
                        // console.log(result)
                        req.flash('success', 'Category deleted')
                        res.redirect('/admin/categories')
    } )
    .catch( err => console.log(err))
})

module.exports = router;
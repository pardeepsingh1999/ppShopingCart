let express = require('express');

let PageSchema = require('../models/pageModel');

let router = express.Router();

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

//get page index
router.get('/', isAdmin, (req, res) => {
    PageSchema.find( {} ).sort( {sorting: 1} ).exec()
    .then( page => {
        res.render('admin/adminPages', {
            pages: page
        })
    })
});

//get add page
router.get('/add-page', isAdmin, (req, res) => {
    
    let title = '';
    let slug = '';
    let content = '';

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
});

//post add page
router.post('/add-page', (req, res) => {
    
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(!slug) {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    let content = req.body.content;

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/add_page', { 
            errors: errors,
            title: title,
            slug: slug,
            content: content
         });
      } else {
          PageSchema.findOne( {slug: slug} )
          .then( (page) => {
              if(page) {
                  req.flash('danger', 'Page slug exists, choose another.');
                  res.render('admin/add_page', {
                      title: title,
                      slug: slug,
                      content: content,
                  });
              } else {
                  PageSchema.create({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 1
                  })
                  .then( page => {
                                    // get all pages to pass to header.ejs
                                    PageSchema.find( {} ).sort( {sorting: 1} ).exec()
                                    .then( page => {
                                        req.app.locals.pages = page;
                                    });

                                    req.flash('success', 'Page added')
                                    res.redirect('/admin/pages') 
                    })
                    .catch( err => console.log(err) );
              }
          })
          .catch( err => console.log(err) );
      }

});

// sort pages function
function sortPages(ids, cb) {

    let count = 0, inc = 0;

    for(let i = 0; i < ids.length; i++) {
        let id = ids[i];
        count++;

        // (function(count) {
        PageSchema.findByIdAndUpdate( id, {$set:{sorting:count}} ).exec()
        // .then(page => console.log(`${count} reorder successfully`))
        .then(page => { 
            ++inc;
            if( inc >= ids.length ) {
                cb();
            } 
        })
        .catch(err => console.log(err))
        // })(count);
    }

}

//post reorder pages
router.post('/reorder-pages', (req, res) => {
    
    let ids = req.body['id[]']

    sortPages(ids, () => { 
        console.log('Reorder pages')
        // get all pages to pass to header.ejs
        PageSchema.find( {} ).sort( {sorting: 1} ).exec()
        .then( page => {
            req.app.locals.pages = page
        })
    })

    res.end('end');

});

//get edit page
router.get('/edit-page/:id', isAdmin, (req, res) => {
    
    PageSchema.findById( req.params.id ).exec()
    .then( result => {
        res.render('admin/edit_page', {
            title: result.title,
            slug: result.slug,
            content: result.content,
            id: result._id
        })
    })
    .catch( err => console.log(err))

});

//post edit page
router.post('/edit-page/:id', (req, res) => {
    
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(!slug) {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    let content = req.body.content;
    let id = req.body.id;

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit_page', { 
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
         });
      } else {
          PageSchema.findOne( { slug: slug, _id:{'$ne':id} } )
          .then( (page) => {
              if(page) {
                  req.flash('danger', 'Page slug exists, choose another.');
                  res.render('admin/edit_page', {
                      title: title,
                      slug: slug,
                      content: content,
                      id: id
                  });
              } else {
                  PageSchema.findByIdAndUpdate( id ,
                    { $set: {
                        title: title,
                        slug: slug,
                        content: content,
                        } 
                    }, 
                    { new: true }
                    )
                    .then( page => {
                                    // get all pages to pass to header.ejs
                                    PageSchema.find( {} ).sort( {sorting: 1} ).exec()
                                    .then( page => {
                                        req.app.locals.pages = page;
                                    });

                                    req.flash('success', 'Page updated')                
                                    res.redirect('/admin/pages') } )

                    .catch( err => console.log(err) );
              }
          })
          .catch( err => console.log(err) );
      }

});

//delete page route
router.get('/delete-page/:id', isAdmin, (req, res) => {
    
    const id = req.params.id;
    // console.log(id)
    PageSchema.findByIdAndRemove( id ).exec()
    .then( result => {
                        // get all pages to pass to header.ejs
                        PageSchema.find( {} ).sort( {sorting: 1} ).exec()
                        .then( page => {
                            req.app.locals.pages = page;
                        });
                        // console.log(result)
                        req.flash('success', 'Page deleted')
                        res.redirect('/admin/pages/')
    } )
    .catch( err => console.log(err))
})

module.exports = router;
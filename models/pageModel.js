const mongoose = require('mongoose');

//page schema
const PageSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    }
}, { collection: 'Page',  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } );

const page = mongoose.model('Page', PageSchema);

module.exports = page;
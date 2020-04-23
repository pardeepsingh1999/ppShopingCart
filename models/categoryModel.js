const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }

}, { collection: 'categories',  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } );

const category = mongoose.model('categories', categorySchema);

module.exports = category;
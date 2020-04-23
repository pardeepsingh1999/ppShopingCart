let mongoose = require('mongoose');

let productSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    productImage: {
        type: String
    }
}, { collection: 'Product', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } );

const product = mongoose.model('Product', productSchema);

module.exports = product;
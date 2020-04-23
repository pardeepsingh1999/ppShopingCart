const mongoose = require('mongoose');

//page schema
const UserSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Number
    }
}, { collection: 'User',  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } );

const userDetail = mongoose.model('User', UserSchema);

module.exports = userDetail;
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    image: String, 
    date: {
        type: Date,
        default: Date.now 
    },
});

module.exports = mongoose.model('Gallery', GallerySchema, 'gallery');

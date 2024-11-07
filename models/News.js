const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    tags: [String],
    overTitle: String,
    lead: String,
    cat: String,
    title: String,
    date: {
        type: Date,
        default: Date.now 
    },
    des: String,
    images: [String],
});

module.exports = mongoose.model('News', NewsSchema);

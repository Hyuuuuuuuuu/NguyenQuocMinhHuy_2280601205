// schemas/categories.js
let mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('category', categorySchema);
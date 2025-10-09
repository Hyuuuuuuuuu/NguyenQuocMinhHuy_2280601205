// schemas/products.js
let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    stock: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },   
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'category',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);
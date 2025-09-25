let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên danh mục không được để trống"],
        unique: true, 
        trim: true 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Category', schema);
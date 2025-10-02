// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            default: '',
        },
        avatarUrl: {
            type: String,
            default: '',
        },
        status: {
            type: Boolean,
            default: false, // false: chưa kích hoạt, true: đã kích hoạt
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role', // Tham chiếu đến model 'Role'
        },
        loginCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware để hash mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
    // Chỉ hash mật khẩu nếu nó đã được thay đổi (hoặc là user mới)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);
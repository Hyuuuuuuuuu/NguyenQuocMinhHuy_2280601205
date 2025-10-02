// controllers/userController.js
const User = require('../models/User');

// 1. Create User
exports.createUser = async (req, res) => {
    try {
        const { username, password, email, fullName, avatarUrl, role } = req.body;
        const newUser = new User({ username, password, email, fullName, avatarUrl, role });
        await newUser.save();
        // Không trả về mật khẩu
        newUser.password = undefined;
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Users (có tìm kiếm)
exports.getAllUsers = async (req, res) => {
    try {
        const { username, fullName } = req.query;
        let query = { isDelete: false };

        // Tìm kiếm theo username (chứa)
        if (username) {
            query.username = { $regex: username, $options: 'i' }; // 'i' để không phân biệt hoa thường
        }

        // Tìm kiếm theo fullName (chứa)
        if (fullName) {
            query.fullName = { $regex: fullName, $options: 'i' };
        }

        const users = await User.find(query).select('-password').populate('role');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get User by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDelete: false })
            .select('-password')
            .populate('role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get User by Username
exports.getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username, isDelete: false })
            .select('-password')
            .populate('role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Update User
exports.updateUser = async (req, res) => {
    try {
        // Không cho phép cập nhật mật khẩu qua route này để đảm bảo an toàn
        // Nếu muốn có chức năng đổi mật khẩu, nên tạo một route riêng
        delete req.body.password;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Soft Delete User
exports.softDeleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isDelete: true }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Activate User Status
// Yêu cầu 2: Viết 1 hàm post truyền lên email và userName nếu thông tin đúng thì chuyển status về true
exports.activateUser = async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({ success: false, message: 'Please provide email and username' });
        }

        const user = await User.findOneAndUpdate(
            { email, username, isDelete: false },
            { status: true },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User with provided email and username not found' });
        }

        res.status(200).json({ success: true, message: 'User activated successfully', data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
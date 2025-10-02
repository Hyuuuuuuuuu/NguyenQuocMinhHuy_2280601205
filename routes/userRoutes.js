// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    updateUser,
    softDeleteUser,
    activateUser,
} = require('../controllers/userController');

// Route đặc biệt để kích hoạt user
router.post('/activate', activateUser);

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/id/:id', getUserById); // Thêm /id/ để tránh xung đột với route /username/:username
router.get('/username/:username', getUserByUsername);
router.put('/:id', updateUser);
router.delete('/soft/:id', softDeleteUser);

module.exports = router;
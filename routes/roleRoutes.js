// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    softDeleteRole,
} = require('../controllers/roleController');

router.post('/', createRole);
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/soft/:id', softDeleteRole); // Dùng /soft/:id để rõ ràng là xoá mềm

module.exports = router;
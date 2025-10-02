// controllers/roleController.js
const Role = require('../models/Role');

// 1. Create Role
exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newRole = new Role({ name, description });
        await newRole.save();
        res.status(201).json({ success: true, data: newRole });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Roles
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isDelete: false });
        res.status(200).json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Role by ID
exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDelete: false });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, data: role });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Role
exports.updateRole = async (req, res) => {
    try {
        const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về document đã được update
            runValidators: true,
        });
        if (!updatedRole) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, data: updatedRole });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Soft Delete Role
exports.softDeleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { isDelete: true },
            { new: true }
        );
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.status(200).json({ success: true, message: 'Role soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
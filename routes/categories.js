// routes/categories.js
var express = require('express');
var router = express.Router();
let Category = require('../schemas/categories');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// GET all categories (View)
router.get('/', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
    try {
        const categories = await Category.find({ isDeleted: false });
        Response(res, 200, true, categories);
    } catch (error) {
        next(error);
    }
});

// GET category by ID (View)
router.get('/:id', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
    try {
        const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
        if (!category) {
            return Response(res, 404, false, "Category not found");
        }
        Response(res, 200, true, category);
    } catch (error) {
        next(error);
    }
});

// CREATE a new category
router.post('/', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
    try {
        const newCategory = new Category({
            name: req.body.name,
            description: req.body.description
        });
        await newCategory.save();
        Response(res, 201, true, newCategory);
    } catch (error) {
        next(error);
    }
});

// UPDATE a category
router.put('/:id', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
    try {
        const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
        if (!category) {
            return Response(res, 404, false, "Category not found");
        }
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        await category.save();
        Response(res, 200, true, category);
    } catch (error) {
        next(error);
    }
});

// DELETE a category (soft delete)
router.delete('/:id', Authentication, Authorization("ADMIN"), async function(req, res, next) {
    try {
        const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
        if (!category) {
            return Response(res, 404, false, "Category not found");
        }
        category.isDeleted = true;
        await category.save();
        Response(res, 200, true, "Category deleted successfully");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
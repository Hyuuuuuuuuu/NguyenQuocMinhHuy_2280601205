// routes/products.js
var express = require('express');
var router = express.Router();
let Product = require('../schemas/products');
let Category = require('../schemas/categories');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// GET all products (View)
router.get('/', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
    try {
        const products = await Product.find({ isDeleted: false }).populate('category', 'name');
        Response(res, 200, true, products);
    } catch (error) {
        next(error);
    }
});

// GET product by ID (View)
router.get('/:id', Authentication, Authorization("USER", "MOD", "ADMIN"), async function(req, res, next) {
    try {
        const product = await Product.findOne({ _id: req.params.id, isDeleted: false }).populate('category', 'name');
        if (!product) {
            return Response(res, 404, false, "Product not found");
        }
        Response(res, 200, true, product);
    } catch (error) {
        next(error);
    }
});

// CREATE a new product
router.post('/', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
    try {
        // Check if category exists
        const category = await Category.findById(req.body.category);
        if (!category || category.isDeleted) {
            return Response(res, 400, false, "Category not found or has been deleted.");
        }

        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category
        });
        await newProduct.save();
        Response(res, 201, true, newProduct);
    } catch (error) {
        next(error);
    }
});

// UPDATE a product
router.put('/:id', Authentication, Authorization("MOD", "ADMIN"), async function(req, res, next) {
    try {
        const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
        if (!product) {
            return Response(res, 404, false, "Product not found");
        }

        // If category is being updated, check if it exists
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category || category.isDeleted) {
                return Response(res, 400, false, "Category not found or has been deleted.");
            }
            product.category = req.body.category;
        }

        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price !== undefined ? req.body.price : product.price;
        product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
        
        await product.save();
        Response(res, 200, true, product);
    } catch (error) {
        next(error);
    }
});

// DELETE a product (soft delete)
router.delete('/:id', Authentication, Authorization("ADMIN"), async function(req, res, next) {
    try {
        const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
        if (!product) {
            return Response(res, 404, false, "Product not found");
        }
        product.isDeleted = true;
        await product.save();
        Response(res, 200, true, "Product deleted successfully");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
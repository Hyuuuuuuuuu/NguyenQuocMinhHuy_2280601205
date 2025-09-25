// routes/products.js
var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product')

/* GET all products (excluding soft-deleted ones) */
router.get('/', async function(req, res, next) {
  try {
    // Chỉ tìm những sản phẩm chưa bị xóa mềm
    let products = await productModel.find({ isDelete: false })
    res.send({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});

/* GET a single product by ID */
router.get('/:id', async function(req, res, next) {
  try {
    let item = await productModel.findById(req.params.id);
    // Kiểm tra sản phẩm có tồn tại và chưa bị xóa mềm không
    if (item && !item.isDelete) {
      res.send({
        success: true,
        data: item
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại"
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    })
  }
});

/* CREATE a new product */
router.post('/', async function(req, res, next) {
  try {
    let newItem = new productModel({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    })
    await newItem.save()
    res.status(201).send({
      success: true,
      data: newItem
    })
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message
    })
  }
})

/* UPDATE a product by ID */
router.put('/:id', async function(req, res, next) {
  try {
    let updatedItem = await productModel.findByIdAndUpdate(
      req.params.id, {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category
      }, {
        new: true // Trả về document đã được cập nhật
      }
    );
    if (updatedItem) {
      res.send({
        success: true,
        data: updatedItem
      })
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy sản phẩm"
      })
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message
    });
  }
})

/* SOFT DELETE a product by ID */
router.delete('/:id', async function(req, res, next) {
  try {
    // Tìm và cập nhật trường isDelete thành true
    let deletedItem = await productModel.findByIdAndUpdate(
      req.params.id, { isDelete: true }, { new: true }
    );
    if (deletedItem) {
      res.send({
        success: true,
        message: "Xóa sản phẩm thành công (soft delete)",
        data: deletedItem
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy sản phẩm để xóa"
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
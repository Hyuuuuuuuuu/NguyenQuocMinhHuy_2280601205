
var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');


router.post('/', async function(req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name
    });
    await newCategory.save();
    res.status(201).send({
      success: true,
      data: newCategory,
      message: "Tạo danh mục thành công"
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message
    });
  }
});


router.get('/', async function(req, res, next) {
  try {
    let categories = await categoryModel.find({});
    res.send({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});


router.get('/:id', async function(req, res, next) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (category) {
      res.send({
        success: true,
        data: category
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục"
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});


router.put('/:id', async function(req, res, next) {
  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true } 
    );
    if (updatedCategory) {
      res.send({
        success: true,
        data: updatedCategory,
        message: "Cập nhật danh mục thành công"
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục để cập nhật"
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    let deletedCategory = await categoryModel.findByIdAndDelete(req.params.id);
    if (deletedCategory) {
      res.send({
        success: true,
        message: "Xóa danh mục thành công"
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Không tìm thấy danh mục để xóa"
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
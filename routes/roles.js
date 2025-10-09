// routes/roles.js
var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/roles');
let { Response } = require('../utils/responseHandler');

/* GET roles listing. */
router.get('/', async function(req, res, next) {
  try {
    let roles = await roleSchema.find({isDeleted: false});
    Response(res, 200, true, roles);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) {
      return Response(res, 404, false, "Role not found");
    }
    Response(res, 200, true, role);
  } catch (error) {
    next(error);
  }
});

router.post('/', async function(req, res, next) {
  try {
    let newRole = new roleSchema({
      name: req.body.name,
      description: req.body.description
    });
    await newRole.save();
    Response(res, 201, true, newRole);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
// routes/users.js
var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
const { Response } = require('../utils/responseHandler'); // <-- Thêm dòng này

/* GET users listing. */
// Gợi ý: Route này nên được bảo vệ, chỉ ADMIN mới có quyền xem tất cả user.
router.get('/', async function(req, res, next) {
  try {
    let allUsers = await users.find({isDeleted:false}).populate({
      path: 'role',
      select:'name'
    });
    Response(res, 200, true, allUsers);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    let user = await users.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      return Response(res, 404, false, "User not found");
    }
    Response(res, 200, true, user);
  } catch (error) {
     next(error);
  }
});

// Route này không cần thiết vì đã có /auth/register
// Nếu giữ lại, nó nên được bảo vệ và chỉ dành cho ADMIN
router.post('/', async function(req, res, next) {
  try {
    let roleName = req.body.role ? req.body.role : "USER";
    let role = await roles.findOne({name: roleName});
    if (!role) {
      return Response(res, 400, false, `Role '${roleName}' does not exist.`);
    }

    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: role._id
    })
    await newUser.save();
    Response(res, 201, true, newUser);
  } catch(error) {
    next(error);
  }
});

router.put('/:id', async function(req, res, next) {
  try {
    // Không cho phép cập nhật username hoặc role qua route này
    const { email, fullName, password } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (password) updateData.password = password; // Sẽ được hash tự động bởi pre-save hook

    // new: true để trả về document đã được cập nhật
    const updatedUser = await users.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!updatedUser) {
      return Response(res, 404, false, "User not found");
    }

    Response(res, 200, true, updatedUser);
  } catch(error) {
    next(error);
  }
});

module.exports = router;
// routes/auth.js
var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken')
let { Response } = require('../utils/responseHandler')
let {Authentication,Authorization}= require('../utils/authHandler')



router.post('/register', async function (req, res, next) {
  try {
    let role = await roles.findOne({ name: "USER" });
    if (!role) {
      // Xử lý trường hợp role USER không tồn tại
      return Response(res, 500, false, "Default role USER not found.");
    }
    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: role._id
    })
    await newUser.save();
    Response(res,201,true,"Đăng kí thành công");
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let user = await users.findOne({
      username: username
    })
    if (!user) {
      return Response(res,404,false,"User không tồn tại");
    } 
    
    let result = bcrypt.compareSync(password, user.password);
    if (result) {
      let token = jwt.sign({
        _id: user._id,
        // exp nên là timestamp tính bằng giây
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 phút
      }, process.env.JWT_SECRET); // <-- SỬA Ở ĐÂY

      res.cookie("token", "Bearer " + token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 ngày
      })
      Response(res,200,true, { token });
    } else {
      Response(res, 401, false, "Sai mật khẩu");
    }
  } catch(error) {
    next(error);
  }
});

router.post("/logout", function (req, res, next) {
  try {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) }); // Xóa cookie hiệu quả
    Response(res, 200, true, "Logout thành công");
  } catch (error) {
    next(error);
  }
})

router.get('/me',Authentication, Authorization("ADMIN","MOD","USER"),async function (req, res, next) {
   try {
    let user = await users.findById(req.userId).select(
      "-password -isDeleted -__v" // Loại bỏ các trường không cần thiết
     ).populate({
      path: 'role',
      select:'name'
    });
     Response(res,200,true,user)
   } catch (error) {
     next(error);
   }
})


module.exports = router;
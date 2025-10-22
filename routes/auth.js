var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');
let { validatorRegister, validatorChangpassword, validatorForgotPassword, validatedResult } = require('../utils/validator');
let { sendMail } = require('../utils/sendMailHandler');
let { uploadAFileWithField } = require('../utils/uploadHandler');

// Đăng ký
router.post('/register', validatorRegister, validatedResult, async function (req, res) {
  try {
    let role = await roles.findOne({ name: "USER" });
    if (!role) return Response(res, 400, false, "Role USER không tồn tại");

    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: role._id
    });
    await newUser.save();
    Response(res, 200, true, "Đăng ký thành công");
  } catch (err) {
    Response(res, 500, false, err.message);
  }
});

// Đăng nhập
router.post('/login', async function (req, res) {
  let { username, password } = req.body;
  let user = await users.findOne({ username });
  if (!user) {
    return Response(res, 404, false, "User không tồn tại");
  }

  let result = bcrypt.compareSync(password, user.password);
  if (!result) {
    return Response(res, 403, false, "Sai mật khẩu");
  }

  // ✅ JWT exp phải là giây
  let token = jwt.sign(
    { _id: user._id },
    "NNPTUD",
    { expiresIn: "15m" }
  );

  res.cookie("token", "Bearer " + token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  Response(res, 200, true, { token });
});

// Đăng xuất
router.post("/logout", function (req, res) {
  try {
    res.cookie("token", "");
    Response(res, 200, true, "Đăng xuất thành công");
  } catch (error) {
    Response(res, 400, false, "Token không hợp lệ");
  }
});

// Thông tin user
router.get('/me', Authentication, Authorization("ADMIN", "MOD", "USER"), async function (req, res) {
  let user = await users.findById(req.userId)
    .select("username email fullName avatarURL")
    .populate({ path: 'role', select: 'name' });
  Response(res, 200, true, user);
});

// Đổi mật khẩu
router.post('/changepassword', Authentication, validatorChangpassword, validatedResult, async function (req, res) {
  let user = await users.findById(req.userId);
  if (bcrypt.compareSync(req.body.oldpassword, user.password)) {
    user.password = req.body.newpassword;
    await user.save();
    Response(res, 200, true, "Đổi mật khẩu thành công");
  } else {
    Response(res, 400, false, "Mật khẩu cũ không đúng");
  }
});

// Quên mật khẩu
router.post('/forgotpassword', validatorForgotPassword, async function (req, res) {
  let user = await users.findOne({ email: req.body.email });
  if (!user) return Response(res, 404, false, "Email không tồn tại");

  user.forgotPasswordToken = GenerateRandomString(64);
  user.forgotPasswordTokenExp = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  let URL = "http://localhost:3000/auth/resetpassword/" + user.forgotPasswordToken;
  await sendMail(URL, user);
  Response(res, 200, true, URL);
});

// Reset mật khẩu
router.post('/resetpassword/:token', async function (req, res) {
  let user = await users.findOne({ forgotPasswordToken: req.params.token });
  if (!user) return Response(res, 404, false, "Token không tồn tại");

  if (user.forgotPasswordTokenExp < Date.now()) {
    user.forgotPasswordToken = "";
    user.forgotPasswordTokenExp = null;
    await user.save();
    return Response(res, 400, false, "Token hết hạn");
  }

  user.password = req.body.newpassword;
  user.forgotPasswordToken = "";
  user.forgotPasswordTokenExp = null;
  await user.save();
  Response(res, 200, true, "Đổi mật khẩu thành công");
});

// Upload avatar
router.post('/upload-avatar', Authentication, uploadAFileWithField('avatar'), async function (req, res) {
  try {
    if (!req.file) return Response(res, 400, false, "Không có ảnh được upload");
    let URL = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    let user = await users.findById(req.userId);
    user.avatarURL = URL;
    await user.save();
    Response(res, 200, true, { message: "Cập nhật avatar thành công", avatarURL: URL });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});


// [POST] /auth/upload-avatar (yêu cầu đăng nhập)
router.post('/upload-avatar', Authentication, uploadAFileWithField('avatar'), async function (req, res) {
  try {
    if (!req.file) return Response(res, 400, false, "Không có ảnh được upload");

    let URL = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    let user = await users.findById(req.userId);
    user.avatarURL = URL;
    await user.save();

    Response(res, 200, true, { message: "Cập nhật avatar thành công", avatarURL: URL });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

function GenerateRandomString(length) {
  let result = "";
  let source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += source.charAt(Math.floor(Math.random() * source.length));
  }
  return result;
}

module.exports = router;

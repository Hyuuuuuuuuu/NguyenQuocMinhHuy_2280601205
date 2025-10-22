// path: utils/sendMailHandler.js
let nodemailer = require('nodemailer');
let path = require('path');
let fs = require('fs');
let handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 25,
  secure: false,
  auth: {
    user: "afb860a426d68e",
    pass: "d3964b7baf52ff",
  },
});

module.exports = {
  sendMail: async function (url, user) {
    let data = fs.readFileSync(path.join(__dirname, '../templates/mailForgotpassword.html'), 'utf-8');
    let template = handlebars.compile(data);
    const html = template({
      user_name: user.username,
      reset_link: url,
      expiry_hours: 0.17, // khoảng 10 phút
      company_name: "NNPTUD"
    });

    await transporter.sendMail({
      from: '"NNPTUD Support" <admin@hehehe.com>',
      to: user.email,
      subject: "Quên mật khẩu",
      html: html,
    });
  }
};

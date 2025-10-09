// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');
let {Response} = require('./utils/responseHandler');
require('dotenv').config(); // Tải các biến môi trường từ file .env

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// Thêm các router mới
var rolesRouter = require('./routes/roles');
var authRouter = require('./routes/auth');
var categoriesRouter = require('./routes/categories');
var productsRouter = require('./routes/products');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Định nghĩa các routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/categories', categoriesRouter);
app.use('/products', productsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, "Not Found"));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // Sửa lỗi để response có cấu trúc nhất quán
  // Nếu là lỗi validation của Mongoose
  if (err.name === 'ValidationError') {
    return Response(res, 400, false, err.message);
  }

  // Nếu là lỗi duplicate key của MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    return Response(res, 409, false, `An account with that ${field} already exists.`);
  }

  // Các lỗi khác
  Response(res, err.status || 500, false, err.message || "Internal Server Error");
});

module.exports = app;
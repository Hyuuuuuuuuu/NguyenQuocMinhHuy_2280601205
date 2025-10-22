// path: utils/responseHandler.js
function Response(res, statusCode, success, data) {
  res.status(statusCode).json({
    success,
    data
  });
}

module.exports = { Response };

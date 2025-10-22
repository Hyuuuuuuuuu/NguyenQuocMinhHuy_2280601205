// path: routes/index.js
var express = require('express');
var router = express.Router();

// Route test
router.get('/', function (req, res) {
  res.status(200).json({ message: 'Server đang hoạt động' });
});

module.exports = router;

var express = require('express');
var router = express.Router();

// Route test
router.get('/', function (req, res) {
  res.json({ message: 'router user' });
});

module.exports = router;

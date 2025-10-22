var express = require('express');
var router = express.Router();

// Lấy danh sách role
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Employee' }
  ]);
});

// Tạo mới role
router.post('/', (req, res) => {
  const { name } = req.body;
  res.json({ message: `Role '${name}' đã được thêm!` });
});

module.exports = router;

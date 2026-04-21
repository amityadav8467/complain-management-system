const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', apiLimiter, protect, authorize('admin'), getAllUsers);
router.put('/:id', apiLimiter, protect, authorize('admin'), updateUser);
router.delete('/:id', apiLimiter, protect, authorize('admin'), deleteUser);

module.exports = router;

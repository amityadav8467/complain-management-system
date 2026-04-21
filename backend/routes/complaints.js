const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  submitComplaint,
  getMyComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  updateStatus,
  assignComplaint,
  getStats,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

// User routes
router.post('/', apiLimiter, protect, upload.array('attachments', 5), complaintValidation, submitComplaint);
router.get('/my', apiLimiter, protect, getMyComplaints);

// Admin routes (must be before /:id to avoid param matching)
router.get('/', apiLimiter, protect, authorize('admin', 'staff'), getAllComplaints);
router.get('/admin/stats', apiLimiter, protect, authorize('admin', 'staff'), getStats);
router.put('/:id/status', apiLimiter, protect, authorize('admin', 'staff'), updateStatus);
router.put('/:id/assign', apiLimiter, protect, authorize('admin'), assignComplaint);

router.get('/:id', apiLimiter, protect, getComplaint);
router.put('/:id', apiLimiter, protect, updateComplaint);
router.delete('/:id', apiLimiter, protect, deleteComplaint);

module.exports = router;

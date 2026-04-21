const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');
const { escapeRegex, whitelistValue } = require('../utils/sanitize');

const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Resolved'];
const ALLOWED_CATEGORIES = ['General', 'Technical', 'Billing', 'Service', 'Other'];
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High'];

// @desc    Submit new complaint
// @route   POST /api/complaints
// @access  Private (user)
exports.submitComplaint = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, category, priority } = req.body;

    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
        }))
      : [];

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      userId: req.user.id,
      attachments,
    });

    await complaint.populate('userId', 'name email');

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private (user)
exports.getMyComplaints = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const status = whitelistValue(req.query.status, ALLOWED_STATUSES);
    const category = whitelistValue(req.query.category, ALLOWED_CATEGORIES);
    const priority = whitelistValue(req.query.priority, ALLOWED_PRIORITIES);

    const query = { userId: req.user.id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      const safeSearch = escapeRegex(String(search).substring(0, 200));
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check access: owner or admin/staff
    if (
      complaint.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'staff'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update own complaint
// @route   PUT /api/complaints/:id
// @access  Private (user - owner only, when Pending)
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit complaint after it has been processed',
      });
    }

    const { title, description, category, priority } = req.body;
    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { title, description, category, priority },
      { new: true, runValidators: true }
    );

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete own complaint
// @route   DELETE /api/complaints/:id
// @access  Private (user or admin)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isOwner = complaint.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await complaint.deleteOne();

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints (admin)
// @route   GET /api/complaints
// @access  Private (admin/staff)
exports.getAllComplaints = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const status = whitelistValue(req.query.status, ALLOWED_STATUSES);
    const category = whitelistValue(req.query.category, ALLOWED_CATEGORIES);
    const priority = whitelistValue(req.query.priority, ALLOWED_PRIORITIES);

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      const safeSearch = escapeRegex(String(search).substring(0, 200));
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status (admin)
// @route   PUT /api/complaints/:id/status
// @access  Private (admin/staff)
exports.updateStatus = async (req, res) => {
  try {
    const status = whitelistValue(req.body.status, ALLOWED_STATUSES);
    if (!status) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const adminNote = req.body.adminNote ? String(req.body.adminNote).substring(0, 1000) : undefined;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNote !== undefined && { adminNote }) },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign complaint to staff (admin)
// @route   PUT /api/complaints/:id/assign
// @access  Private (admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/complaints/stats
// @access  Private (admin/staff)
exports.getStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const byPriority = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: { total, pending, inProgress, resolved, byCategory, byPriority },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

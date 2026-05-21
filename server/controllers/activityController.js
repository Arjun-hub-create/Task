const ActivityLog = require('../models/ActivityLog');

// @GET /api/v1/activity
const getActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.userId = req.query.userId;

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'username email avatarColor')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/v1/activity/task/:id
const getTaskActivity = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ taskId: req.params.id })
      .populate('userId', 'username email avatarColor')
      .sort({ timestamp: -1 });

    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivity, getTaskActivity };

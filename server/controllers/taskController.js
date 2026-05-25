const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('../config/socket');

const createActivityLog = async (data) => {
  try {
    const log = await ActivityLog.create(data);
    const populated = await log.populate([
      { path: 'userId', select: 'username email avatarColor' },
      { path: 'taskId', select: 'title' },
    ]);
    return populated;
  } catch (err) {
    console.error('Activity log error:', err);
  }
};

// @GET /api/v1/tasks
const getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    // Users can only see tasks assigned to them; managers may see all tasks.
    if (req.user.role === 'user') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const sortField = req.query.sortBy || 'order';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username email avatarColor')
      .populate('createdBy', 'username email avatarColor')
      .sort({ [sortField]: sortOrder, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/v1/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username email avatarColor')
      .populate('createdBy', 'username email avatarColor');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Users can only see their assigned tasks; managers may view any task.
    if (req.user.role === 'user' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @POST /api/v1/tasks — Manager only
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ success: false, message: 'Title and assignedTo are required.' });
    }

    // Get max order for new task
    const maxOrder = await Task.findOne({}).sort({ order: -1 }).select('order');
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo,
      createdBy: req.user._id,
      dueDate,
      tags: tags || [],
      order,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'username email avatarColor' },
      { path: 'createdBy', select: 'username email avatarColor' },
    ]);

    const log = await createActivityLog({
      taskId: task._id,
      userId: req.user._id,
      action: 'created',
      details: `Task "${task.title}" was created`,
      newValue: { title: task.title, status: task.status, priority: task.priority },
    });

    try {
      const io = getIO();
      io.to('workspace').emit('task:created', populated);
      if (log) io.to('workspace').emit('activity:new', log);
    } catch (e) {}

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/v1/tasks/:id — Manager only
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const previousStatus = existing.status;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, assignedTo, dueDate, tags },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'username email avatarColor')
      .populate('createdBy', 'username email avatarColor');

    let action = 'updated';
    let details = `Task "${task.title}" was updated`;

    if (previousStatus !== status && status) {
      action = status === 'completed' ? 'completed' : 'status_changed';
      details = `Status changed from '${previousStatus}' to '${status}'`;
    }

    const log = await createActivityLog({
      taskId: task._id,
      userId: req.user._id,
      action,
      details,
      previousValue: { status: previousStatus },
      newValue: { status: task.status },
    });

    try {
      const io = getIO();
      io.to('workspace').emit('task:updated', task);
      if (log) io.to('workspace').emit('activity:new', log);
    } catch (e) {}

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/v1/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['todo', 'in-progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Users can only update their own tasks
    if (req.user.role === 'user' && existing.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const previousStatus = existing.status;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      },
      { new: true }
    )
      .populate('assignedTo', 'username email avatarColor')
      .populate('createdBy', 'username email avatarColor');

    const action = status === 'completed' ? 'completed' : 'status_changed';
    const log = await createActivityLog({
      taskId: task._id,
      userId: req.user._id,
      action,
      details: `Status changed from '${previousStatus}' to '${status}'`,
      previousValue: { status: previousStatus },
      newValue: { status },
    });

    try {
      const io = getIO();
      io.to('workspace').emit('task:status', { taskId: task._id, status, task });
      if (log) io.to('workspace').emit('activity:new', log);
    } catch (e) {}

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @PATCH /api/v1/tasks/:id/order
const updateTaskOrder = async (req, res, next) => {
  try {
    const { order, status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { order, ...(status ? { status } : {}) },
      { new: true }
    )
      .populate('assignedTo', 'username email avatarColor')
      .populate('createdBy', 'username email avatarColor');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    try {
      const io = getIO();
      io.to('workspace').emit('task:updated', task);
    } catch (e) {}

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/v1/tasks/:id — Manager only
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const taskTitle = task.title;
    await Task.findByIdAndDelete(req.params.id);

    const log = await createActivityLog({
      taskId: req.params.id,
      userId: req.user._id,
      action: 'deleted',
      details: `Task "${taskTitle}" was deleted`,
      previousValue: { title: taskTitle },
    });

    try {
      const io = getIO();
      io.to('workspace').emit('task:deleted', { taskId: req.params.id });
      if (log) io.to('workspace').emit('activity:new', log);
    } catch (e) {}

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, updateTaskStatus, updateTaskOrder, deleteTask };

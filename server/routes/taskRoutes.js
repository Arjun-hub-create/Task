const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskOrder,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', checkRole('manager'), createTask);
router.put('/:id', checkRole('manager'), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/order', updateTaskOrder);
router.delete('/:id', checkRole('manager'), deleteTask);

module.exports = router;

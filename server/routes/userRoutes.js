const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkRole('manager'), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);

module.exports = router;

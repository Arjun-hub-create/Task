const express = require('express');
const router = express.Router();
const { getActivity, getTaskActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getActivity);
router.get('/task/:id', getTaskActivity);

module.exports = router;

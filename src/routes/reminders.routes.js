const express = require('express');
const { getReminders } = require('../controllers/reminders.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getReminders);

module.exports = router;

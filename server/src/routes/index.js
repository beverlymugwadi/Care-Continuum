const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const motherRoutes = require('./mother.routes');
const childRoutes = require('./child.routes');
const remindersRoutes = require('./reminders.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mothers', motherRoutes);
router.use('/children', childRoutes);
router.use('/reminders', remindersRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

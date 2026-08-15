const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const motherRoutes = require('./mother.routes');
const childRoutes = require('./child.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mothers', motherRoutes);
router.use('/children', childRoutes);

module.exports = router;

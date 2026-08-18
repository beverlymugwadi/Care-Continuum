const express = require('express');
const { runScan } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/run-scan', runScan);

module.exports = router;

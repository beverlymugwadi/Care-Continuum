const express = require('express');
const {
  getChildById,
  addGrowthRecord,
  completeVaccination,
} = require('../controllers/child.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:id', getChildById);
router.post('/:id/growth', addGrowthRecord);
router.post('/:id/vaccinations/:vaccineId/complete', completeVaccination);

module.exports = router;

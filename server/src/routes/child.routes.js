const express = require('express');
const {
  getChildById,
  addGrowthRecord,
  completeVaccination,
} = require('../controllers/child.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const childValidator = require('../validators/child.validator');

const router = express.Router();

router.use(protect);

router.get('/:id', validate(childValidator.getById), getChildById);
router.post('/:id/growth', validate(childValidator.addGrowthRecord), addGrowthRecord);
router.post(
  '/:id/vaccinations/:vaccineId/complete',
  validate(childValidator.completeVaccination),
  completeVaccination
);

module.exports = router;

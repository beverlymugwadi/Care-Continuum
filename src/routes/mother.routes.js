const express = require('express');
const {
  createMother,
  getMothers,
  getMotherById,
  updateMother,
  recordBirth,
} = require('../controllers/mother.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const motherValidator = require('../validators/mother.validator');

const router = express.Router();

router.use(protect);

router.post('/', validate(motherValidator.create), createMother);
router.get('/', getMothers);
router.get('/:id', validate(motherValidator.getById), getMotherById);
router.put('/:id', validate(motherValidator.update), updateMother);
router.post('/:id/birth', validate(motherValidator.recordBirth), recordBirth);

module.exports = router;

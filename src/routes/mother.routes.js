const express = require('express');
const {
  createMother,
  getMothers,
  getMotherById,
  updateMother,
  recordBirth,
} = require('../controllers/mother.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createMother);
router.get('/', getMothers);
router.get('/:id', getMotherById);
router.put('/:id', updateMother);
router.post('/:id/birth', recordBirth);

module.exports = router;

const express = require('express');
const {
  createMother,
  getMothers,
  getMotherById,
  updateMother,
} = require('../controllers/mother.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createMother);
router.get('/', getMothers);
router.get('/:id', getMotherById);
router.put('/:id', updateMother);

module.exports = router;

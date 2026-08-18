const express = require('express');
const {
  createMother,
  getMothers,
  getMotherById,
  updateMother,
  recordBirth,
  recordHealthAlert,
  listNotifications,
  resendNotification,
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
router.post('/:id/health-alert', validate(motherValidator.healthAlert), recordHealthAlert);
router.get(
  '/:id/notifications',
  validate(motherValidator.listNotifications),
  listNotifications
);
router.post(
  '/:id/notifications/:notificationId/resend',
  validate(motherValidator.resendNotification),
  resendNotification
);

module.exports = router;

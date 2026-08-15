const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidator = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(authValidator.register), register);
router.post('/login', validate(authValidator.login), login);

module.exports = router;

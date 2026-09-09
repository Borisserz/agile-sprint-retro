const express = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/change-password', authenticate, controller.changePassword);

module.exports = router;

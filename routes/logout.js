const express = require('express');
const router = express.Router();

const logoutController = require('../controller/logoutController');

router.get('/', logoutController.handleLogout);

module.exports = router;

// https://www.youtube.com/watch?v=f2EqECiTBL8 5:02

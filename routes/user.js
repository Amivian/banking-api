const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/users/register', userController.registerUser);
router.post('/users/login', userController.loginUser);
router.post('/accounts/fund', auth, userController.fundAccount);
router.post('/accounts/transfer', auth, userController.transferFunds);
router.post('/accounts/withdraw', auth, userController.withdrawFunds);

module.exports = router;

const express = require('express');
const router = express.Router();
const { loginAirtable, handleCallback, getMe } = require('../controllers/authController');

router.get('/airtable', loginAirtable);
router.get('/callback', handleCallback);
router.get('/me', getMe);

module.exports = router;
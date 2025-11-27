// server/routes/formRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import ALL controller functions in one go
const { 
  getBases, 
  getTables, 
  getFields, 
  createForm, 
  getFormById, 
  getMyForms,
  submitForm,
  getFormResponses
} = require('../controllers/formController');

// --- Protected Routes (Require Login) ---
router.get('/bases', protect, getBases);
router.get('/tables/:baseId', protect, getTables);
router.get('/fields/:baseId/:tableId', protect, getFields);
router.post('/', protect, createForm);
router.get('/my-forms', protect, getMyForms);
router.get('/:formId/responses', protect, getFormResponses);

// --- Public Routes (No Login Required) ---
router.get('/:id', getFormById);
router.post('/submit/:formId', submitForm);

module.exports = router;
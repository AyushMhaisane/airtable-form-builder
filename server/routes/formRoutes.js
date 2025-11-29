const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

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

router.get('/bases', protect, getBases);
router.get('/tables/:baseId', protect, getTables);
router.get('/fields/:baseId/:tableId', protect, getFields);
router.post('/', protect, createForm);
router.get('/my-forms', protect, getMyForms);
router.get('/:formId/responses', protect, getFormResponses);

router.get('/:id', getFormById);
router.post('/submit/:formId', submitForm);

module.exports = router;
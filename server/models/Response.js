const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String }, 
  answers: { type: Map, of: String }, 
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);
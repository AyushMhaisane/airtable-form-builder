// server/models/Response.js
const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String }, // ID returned from Airtable
  answers: { type: Map, of: String }, // Stores { "fld123": "John", "fld456": "Engineer" }
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);
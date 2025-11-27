// server/models/Form.js
const mongoose = require('mongoose');

// We define the sub-schema explicitly to avoid confusion
const FieldSchema = new mongoose.Schema({
  airtableFieldId: { type: String },
  label: { type: String },
  type: { type: String },
  options: [String], // Array of strings is fine here
  required: { type: Boolean, default: false },
  conditions: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false }); // Disable auto-ID for fields

const FormSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String },
  airtableBaseId: { type: String },
  airtableTableId: { type: String },
  
  // Attach the sub-schema here
  fields: [FieldSchema] 
});

// We verify the model hasn't been compiled yet
const Form = mongoose.models.Form || mongoose.model('Form', FormSchema);

module.exports = Form;
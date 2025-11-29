const mongoose = require('mongoose');


const FieldSchema = new mongoose.Schema({
  airtableFieldId: { type: String },
  label: { type: String },
  type: { type: String },
  options: [String], 
  required: { type: Boolean, default: false },
  conditions: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false }); 

const FormSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String },
  airtableBaseId: { type: String },
  airtableTableId: { type: String },
  
  fields: [FieldSchema] 
});

const Form = mongoose.models.Form || mongoose.model('Form', FormSchema);

module.exports = Form;
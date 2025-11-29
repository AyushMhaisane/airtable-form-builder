const axios = require('axios');
const Form = require('../models/Form');
const Response = require('../models/Response');

const airtableRequest = async (user, method, url) => {
  try {
    const response = await axios({
      method,
      url: `https://api.airtable.com/v0${url}`,
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Airtable API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch from Airtable');
  }
};


exports.getBases = async (req, res) => {
  try {
    const data = await airtableRequest(req.user, 'GET', '/meta/bases');
    res.json(data.bases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const data = await airtableRequest(req.user, 'GET', `/meta/bases/${baseId}/tables`);
    res.json(data.tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getFields = async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const data = await airtableRequest(req.user, 'GET', `/meta/bases/${baseId}/tables`);
    
    const table = data.tables.find(t => t.id === tableId);
    if (!table) return res.status(404).json({ error: 'Table not found' });

    const supportedTypes = [
      'singleLineText', 
      'multilineText', 
      'singleSelect', 
      'multipleSelects', 
      'multipleAttachments',
      'email',
      'url'
    ];

    const fields = table.fields.filter(f => supportedTypes.includes(f.type));

    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMyForms = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id }).sort({ _id: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createForm = async (req, res) => {
  try {
    console.log("----- INCOMING FORM DATA -----");
    console.log(JSON.stringify(req.body, null, 2)); 

    const { title, baseId, tableId, fields } = req.body;

    // Validate inputs manually if needed
    if (!title || !baseId || !tableId || !fields) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const form = await Form.create({
      userId: req.user._id,
      title,
      airtableBaseId: baseId,
      airtableTableId: tableId,
      fields 
    });

    console.log("Form Saved Successfully:", form._id);
    res.status(201).json(form);

  } catch (error) {
    console.error("Error Saving Form:", error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors 
    });
  }
};


exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.submitForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body; 

    console.log(`📝 Submitting Form: ${formId}`);
    console.log("Raw Answers:", answers);

    // 1. Fetch Form & User
    const form = await Form.findById(formId).populate('userId');
    
    if (!form) {
      console.error("Form not found in DB");
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.userId || !form.userId.accessToken) {
      console.error("Form owner has no access token. Re-login required.");
      return res.status(401).json({ error: 'Form owner authorization missing' });
    }

  
    const cleanFields = {};
    Object.keys(answers).forEach(key => {
      if (answers[key] !== "" && answers[key] !== null && answers[key] !== undefined) {
        cleanFields[key] = answers[key];
      }
    });

    if (Object.keys(cleanFields).length === 0) {
      return res.status(400).json({ error: "Cannot submit an empty form" });
    }

    const airtablePayload = {
      fields: cleanFields,
      typecast: true 
    };

    console.log("Sending to Airtable:", JSON.stringify(airtablePayload, null, 2));

   
    const airtableRes = await axios.post(
      `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableId}`,
      airtablePayload,
      {
        headers: { 
          Authorization: `Bearer ${form.userId.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Airtable Accepted. Record ID:", airtableRes.data.id);

    await Response.create({
      formId,
      airtableRecordId: airtableRes.data.id,
      answers: cleanFields
    });

    res.status(201).json({ success: true, recordId: airtableRes.data.id });

  } catch (error) {
    console.error("❌ SUBMISSION FAILED ❌");
    if (error.response) {
      
      console.error("Airtable Status:", error.response.status);
      console.error("Airtable Data:", JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).json({ 
        error: "Airtable rejected the data", 
        details: error.response.data 
      });
    } else {
      console.error("Server Error:", error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};


exports.getFormResponses = async (req, res) => {
  try {
    
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    
    
    if (form.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const responses = await Response.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
    
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const axios = require('axios');
const Form = require('../models/Form');
const Response = require('../models/Response');

// --- Helper to handle Airtable API calls ---
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

// --- Controller Functions ---

// @desc    Get all Bases
// @route   GET /api/forms/bases
exports.getBases = async (req, res) => {
  try {
    const data = await airtableRequest(req.user, 'GET', '/meta/bases');
    res.json(data.bases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get Tables for a Base
// @route   GET /api/forms/tables/:baseId
exports.getTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const data = await airtableRequest(req.user, 'GET', `/meta/bases/${baseId}/tables`);
    res.json(data.tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get Fields for a Table (Filtered)
// @route   GET /api/forms/fields/:baseId/:tableId
exports.getFields = async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const data = await airtableRequest(req.user, 'GET', `/meta/bases/${baseId}/tables`);
    
    // Find the specific table
    const table = data.tables.find(t => t.id === tableId);
    if (!table) return res.status(404).json({ error: 'Table not found' });

    // FILTER: Only allow supported field types
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

// @desc    Get Forms created by the current user
// @route   GET /api/forms/my-forms
exports.getMyForms = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id }).sort({ _id: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save a new Form Schema
// @route   POST /api/forms
exports.createForm = async (req, res) => {
  try {
    // --- DEBUGGING LOGS ---
    console.log("----- INCOMING FORM DATA -----");
    console.log(JSON.stringify(req.body, null, 2)); 
    // ----------------------

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
      fields // This must match the Schema structure
    });

    console.log("✅ Form Saved Successfully:", form._id);
    res.status(201).json(form);

  } catch (error) {
    console.error("❌ Error Saving Form:", error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors // Mongoose validation details
    });
  }
};

// @desc    Get Form by ID (Public)
// @route   GET /api/forms/:id
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Submit a Form Response
// @route   POST /api/forms/submit/:formId
// @route   POST /api/forms/submit/:formId
exports.submitForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body; 

    console.log(`📝 Submitting Form: ${formId}`);
    console.log("Raw Answers:", answers);

    // 1. Fetch Form & User
    const form = await Form.findById(formId).populate('userId');
    
    if (!form) {
      console.error("❌ Form not found in DB");
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.userId || !form.userId.accessToken) {
      console.error("❌ Form owner has no access token. Re-login required.");
      return res.status(401).json({ error: 'Form owner authorization missing' });
    }

    // 2. CLEAN THE DATA (Crucial for Airtable)
    // Remove empty strings or nulls, otherwise Airtable throws 422
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
      typecast: true // This allows "Engineering" string to map to a Select Option
    };

    console.log("✈️ Sending to Airtable:", JSON.stringify(airtablePayload, null, 2));

    // 3. Send to Airtable
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

    // 4. Save Backup to MongoDB
    await Response.create({
      formId,
      airtableRecordId: airtableRes.data.id,
      answers: cleanFields
    });

    res.status(201).json({ success: true, recordId: airtableRes.data.id });

  } catch (error) {
    // LOG THE REAL ERROR
    console.error("❌ SUBMISSION FAILED ❌");
    if (error.response) {
      // The request was made and the server responded with a status code
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

// @desc    Get Responses for a specific form
// @route   GET /api/forms/:formId/responses
exports.getFormResponses = async (req, res) => {
  try {
    // 1. Check if form exists and belongs to user
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    
    // Security check: Only owner can view responses
    if (form.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // 2. Fetch responses
    const responses = await Response.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
    
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// server/controllers/authController.js
const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// --- PKCE Helper Functions ---
function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

// 1. Redirect to Airtable (With PKCE)
exports.loginAirtable = (req, res) => {
  // A. Generate PKCE Verifier & Challenge
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier));

  // B. Store Verifier in a short-lived cookie (Needed for step 2)
  res.cookie('airtable_code_verifier', verifier, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 1 hour

  const scopes = [
    'data.records:read',
    'data.records:write',
    'schema.bases:read', 
    'webhook:manage',
    'user.email:read'
  ].join(' ');
  
  const redirectUri = process.env.AIRTABLE_REDIRECT_URI;
  const clientId = process.env.AIRTABLE_CLIENT_ID;
  const state = 'random_state_123'; // In prod, make this random

  // C. Build URL with PKCE params
  const url = `https://airtable.com/oauth2/v1/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
  
  res.redirect(url);
};

// 2. Handle the Callback
exports.handleCallback = async (req, res) => {
  const { code, error } = req.query;
  const verifier = req.cookies.airtable_code_verifier; // Retrieve the secret

  if (error) return res.status(400).json({ error: `Airtable Error: ${error}` });
  if (!code) return res.status(400).json({ error: 'Authorization code missing' });
  if (!verifier) return res.status(400).json({ error: 'PKCE Verifier missing (Cookie expired?)' });

  try {
    // A. Exchange Code for Tokens (Include code_verifier)
    const credentials = Buffer.from(
      `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await axios.post(
      'https://airtable.com/oauth2/v1/token',
      new URLSearchParams({
        code,
        redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code_verifier: verifier // <--- CRITICAL: Proves we are the same app
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // B. Get User Identity
    const userResponse = await axios.get('https://api.airtable.com/v0/meta/whoami', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const airtableUserId = userResponse.data.id;
    const email = userResponse.data.email;

    // C. Save/Update User
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    let user = await User.findOne({ airtableUserId });
    if (user) {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.tokenExpiresAt = tokenExpiresAt;
      user.lastLogin = Date.now();
      await user.save();
    } else {
      user = await User.create({
        airtableUserId,
        email,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt
      });
    }

    // D. Issue App Token
    // ... inside handleCallback ...

    // D. Issue App Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Cleanup temporary cookie
    res.clearCookie('airtable_code_verifier');

    // Set real auth cookie (UPDATED FOR PRODUCTION)
    res.cookie('token', token, {
      httpOnly: true,
      // "secure: true" is REQUIRED for SameSite=None
      secure: true, 
      // "SameSite: none" is REQUIRED for Cross-Domain (Vercel -> Render)
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to the Frontend Dashboard
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);

  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.response?.data 
    });
  }
};

// 3. Get Current User
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ isAuthenticated: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    
    res.json({ isAuthenticated: true, user });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false });
  }
};
const express = require('express');
const router = express.Router();
const { supabase, getClientWithToken } = require('../supabaseClient');
const requireAuth = require('../middleware/requireAuth');

// 1. POST /auth/signup
router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || typeof email !== 'string' || email.trim() === '' ||
      !password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: "Email and password are required and must be non-empty strings" });
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password
    });
    
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    
    res.status(201).json(data.user);
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// 2. POST /auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || typeof email !== 'string' || email.trim() === '' ||
      !password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: "Email and password are required and must be non-empty strings" });
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    
    if (error) {
      // Surfacing wrong credentials as 401 with required error message
      return res.status(401).json({ error: "Invalid login credentials" });
    }
    
    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

// 3. POST /auth/logout (Protected)
router.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    const client = getClientWithToken(req.token);
    const { error } = await client.auth.signOut();
    
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// 4. GET /public/info
router.get('/public/info', (req, res) => {
  res.json({ message: "Welcome stranger! This info is public." });
});

// 5. GET /protected/profile (Protected)
router.get('/protected/profile', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at
  });
});

module.exports = router;

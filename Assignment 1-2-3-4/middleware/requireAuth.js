const { supabase } = require('../supabaseClient');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access token required" });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  
  try {
    // Verify the JWT by fetching the user profile from Supabase Auth service
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    // Attach verified user and token reference to request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = requireAuth;

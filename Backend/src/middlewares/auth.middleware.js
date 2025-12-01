const userModel = require('../models/user.model'); 
const jwt = require('jsonwebtoken');


async function authUser(req, res, next) {
  let token = req.cookies.token;
  
  console.log('Auth middleware called');
  console.log('Token in cookies:', !!token);
  console.log('Authorization header:', req.headers.authorization);
  
  // Also check Authorization header if no token in cookies
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Token extracted from Authorization header');
    }
  }
  
  if(!token){
    console.log('No token found');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  try{
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.id);
    const user = await userModel.findById(decoded.id);
    console.log('User found:', user ? user.Email : 'null');
    req.user = user;
    next();
  }catch(err){
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

module.exports = { authUser };
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    console.log('📝 Registration request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const startTime = Date.now();
    const { Fullname, Email, Password } = req.body;

    if (!Fullname || !Fullname.firstname || !Fullname.lastname) {
      return res
        .status(400)
        .json({ message: "Fullname with firstname and lastname is required" });
    }

    if (!Email || !Password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    // Check if user exists
    const checkStart = Date.now();
    const isUserAlreadyExists = await userModel.findOne({ Email });
    console.log(`[PERF] User check took: ${Date.now() - checkStart}ms`);
    
    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password (optimized to 8 rounds for faster performance)
    const hashStart = Date.now();
    const hashedPassword = await bcrypt.hash(Password, 8);
    console.log(`[PERF] Password hashing took: ${Date.now() - hashStart}ms`);
    
    // Create user
    const createStart = Date.now();
    const user = await userModel.create({
      FullName: { firstname: Fullname.firstname, lastname: Fullname.lastname },
      Email,
      Password: hashedPassword,
    });
    console.log(`[PERF] User creation took: ${Date.now() - createStart}ms`);
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    console.log(`[PERF] Total registration time: ${Date.now() - startTime}ms`);
    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: { id: user._id, Email: user.Email, FullName: user.FullName },
        token
      });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      message: 'Error creating user account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

async function loginUser(req, res) {
  try {
    console.log('Login request received');
    console.log('Request body:', req.body);
    
    const { Email, Password } = req.body;
    
    if (!Email || !Password) {
      console.log('Missing Email or Password');
      return res.status(400).json({ message: 'Email and Password are required' });
    }
    
    const user = await userModel.findOne({ Email });
    console.log('User found:', user ? user.Email : 'null');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res
      .status(200)
      .json({
        message: "Login successful",
        user: { id: user._id, Email: user.Email, FullName: user.FullName },
        token
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

module.exports = { registerUser, loginUser };

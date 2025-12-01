const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  const { Fullname, Email, Password } = req.body;

  if (!Fullname || !Fullname.firstname || !Fullname.lastname) {
    return res
      .status(400)
      .json({ message: "Fullname with firstname and lastname is required" });
  }

  const isUserAlreadyExists = await userModel.findOne({ Email });
  if (isUserAlreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  const user = await userModel.create({
    FullName: { firstname: Fullname.firstname, lastname: Fullname.lastname },
    Email,
    Password: hashedPassword,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
  res
    .status(201)
    .json({
      message: "User registered successfully",
      user: { id: user._id, Email: user.Email, FullName: user.FullName },
      token
    });
}

async function loginUser(req, res) {
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
}
module.exports = { registerUser, loginUser };

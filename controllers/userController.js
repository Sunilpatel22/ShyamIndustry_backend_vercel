import { generateToken } from "../middleware/jwtAuthMiddleware.js";
import User from "../models/userSchema.js";
import Profile from "../models/profileSchema.js"; // 🎯 IMPORTED PROFILE SCHEMA

// ==========================================
// 1. SIGNUP CONTROLLER (AUTOMATIC PROFILE INITIALIZATION)
// ==========================================
export const signup = async (req, res, next) => {
  try {
    const { fullname, email, mobileNumber, role, password, confirmPassword } = req.body;

    if (!fullname || !email || !mobileNumber || !role || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // 🎯 FIXED: Map properties strictly to match your schema enum rules safely ("customer" or "admin")
    const validatedRole = role.toLowerCase().includes('admin') ? 'admin' : 'customer';

    const newUser = new User({
      fullname: fullname.trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber.trim(),
      role: validatedRole,
      password: password // 🎯 FIXED: Pass RAW password here. The Schema pre-save hook will hash it automatically!
    });

    await newUser.save();

    const token = generateToken(newUser);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    // 🎯 FIXED: Stops hiding the crash! Forces the real model schema bug to show in Postman
    return res.status(500).json({ 
      success: false, 
      error: "Profile Insertion Crash Detected", 
      message: error.message,
      stack: error.stack
    });
  }

};
// ==========================================
// 2. SIGNIN CONTROLLER (OPEN TO EVERY USER)
// ==========================================
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'email or password not valid' });
    }

    const payload = {
      id: user._id, 
      fullname: user.fullname,
      role: user.role 
    };

    const token = generateToken(payload);

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log(`✅ User logged in successfully. Role: ${user.role}`);
    
    return res.status(200).json({ 
      user: userResponse,
      token: token 
    });
    
  } catch (error) {
    console.error('❌ Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==========================================
// 3. GET ME CONTROLLER
// ==========================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User session profile no longer exists" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Get Me Profile Error:', error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ==========================================
// 4. GET ALL USERS CONTROLLER
// ==========================================
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ users });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const registerNewAccount = async (req, res, next) => {
  try {
    console.log("📥 Registration Payload Received:", req.body);

    const { 
      fullname, 
      email, 
      phoneNumber,    // Matches frontend form state binding names
      registerAs,     // Matches frontend role selection dropdown
      password, 
      confirmPassword 
    } = req.body;

    // 1. Unified Validation Check
    if (!fullname || !email || !phoneNumber || !registerAs || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // 2. Format inputs to pass Schema rules seamlessly
    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = phoneNumber.replace(/\s+/g, '').trim(); // Cleans spatial separation noise
    
    // Maps "Customer / Standard User" string seamlessly to your schema enum rule ("customer")
    const validatedRole = registerAs.toLowerCase().includes("admin") ? "admin" : "customer";

    // 3. Database Duplicity Scans
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const mobileExists = await User.findOne({ mobileNumber: cleanMobile });
    if (mobileExists) {
      return res.status(400).json({ success: false, message: "Mobile number is already registered" });
    }

    // 4. Persistence to MongoDB
    // Note: Pass raw password. Your pre-save hook handles hashing securely.
    const userInstance = new User({
      fullname: fullname.trim(),
      email: cleanEmail,
      mobileNumber: cleanMobile,
      role: validatedRole,
      password: password
    });

    const savedUser = await userInstance.save();
    
    // 5. Build Authentication Credentials Token
    const token = generateToken(savedUser);
    const clientData = savedUser.toObject();
    delete clientData.password;

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully!",
      token,
      user: clientData
    });

  } catch (error) {
    // Forwards the detailed Mongoose stack to your server.js error boundary hook
    next(error); 
  }
};
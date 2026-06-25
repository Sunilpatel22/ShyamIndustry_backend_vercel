import { generateToken } from "../middleware/jwtAuthMiddleware.js";
import User from "../models/userSchema.js";
import Profile from "../models/profileSchema.js"; // 🎯 IMPORTED PROFILE SCHEMA

// ==========================================
// 1. SIGNUP CONTROLLER (AUTOMATIC PROFILE INITIALIZATION)
// ==========================================
export const signup = async (req, res) => {
  try {
    const { fullname, email, mobileNumber, role, password, confirmPassword, adminSecretKey } = req.body;

    if (!password || !confirmPassword || password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Admin secret verification gate using .env file
    let finalRole = 'customer'; 
    if (role === 'admin') {
      if (adminSecretKey !== process.env.SECRET_PASSKEY) {
        return res.status(403).json({ error: "Invalid Admin Secret Key. You cannot register as an admin." });
      }
      finalRole = 'admin'; 
    }

    const newUser = new User({ 
      fullname, 
      email, 
      mobileNumber, 
      role: finalRole, 
      password 
    });
    
    const savedUser = await newUser.save();

    // 🎯 AUTOMATIC PROFILE CREATION LOGIC
    // Creates a matching profile row linked directly to the new user's MongoDB ObjectId
    const defaultProfile = new Profile({
      user: savedUser._id,
      avatar: "",
      bio: "",
      address: { street: "", city: "", state: "", zipCode: "", country: "" },
      gender: "prefer not to say"
    });
    await defaultProfile.save();

    const payload = { id: savedUser._id, fullname: savedUser.fullname };
    const token = generateToken(payload);

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    console.log(`✅ User registered successfully with automatic profile matching. Role: ${savedUser.role}`);

    return res.status(201).json({
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
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

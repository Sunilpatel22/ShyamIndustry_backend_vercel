import Profile from "../models/profileSchema.js";
import crypto from "crypto";

// 🎯 INTERNAL HELPER: Converts memory buffers into a shortened hostname string URL
const generateShortImageUrl = (req) => {
  if (!req.file) return "";

  // 1. Generate a small 8-character unique fingerprint filename
  const shortId = crypto.randomBytes(4).toString("hex"); 
  const fileExtension = req.file.mimetype.split("/") || "jpg";
  const filename = `img_${shortId}.${fileExtension}`;

  // 2. AUTOMATIC HOSTNAME DETECTOR:
  // Local Dev -> http://localhost:5000/uploads/img_a1b2c3.jpg
  // Vercel Live -> https://vercel.app
  const absoluteHostUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

  return absoluteHostUrl;
};

// Helper function to safely process nested address properties sent via form-data strings
const parseAddressField = (address) => {
  if (!address) return undefined;
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (e) {
      throw new Error("Invalid address JSON format string provided.");
    }
  }
  return address;
};

// ====================================================
// ✅ GET PROFILE CONTROLLER (With Self-Healing Creation)
// ====================================================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. User session token missing." });
    }

    // 1. Attempt to find the user profile
    let profile = await Profile.findOne({ user: userId }).populate(
      "user",
      "fullname email mobileNumber role"
    );

    // 2. 🎯 SELF-HEALING HOOK: Auto-create a skeleton profile if a legacy user doesn't have one
    if (!profile) {
      console.log(`💡 Legacy account detected for User ID: ${userId}. Initializing profile shell...`);
      const newProfileShell = new Profile({
        user: userId,
        avatar: "",
        bio: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        gender: "prefer not to say"
      });
      await newProfileShell.save();

      // Fetch the newly created profile with populated user details
      profile = await Profile.findOne({ user: userId }).populate(
        "user",
        "fullname email mobileNumber role"
      );
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Database tracking error inside getProfile:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ====================================================
// ✅ UPDATE PROFILE CONTROLLER (Short Form URL Engine)
// ====================================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Profile ownership validation failed." });
    }

    const { bio, dateOfBirth, gender, address } = req.body;
    
    // 1. Attempt to find target profile
    let targetProfile = await Profile.findOne({ user: userId });
    
    // 2. 🎯 SELF-HEALING HOOK: Fallback instantiation if document is missing
    if (!targetProfile) {
      targetProfile = new Profile({ user: userId });
    }

    // 3. 🎯 FIXED FOR SHORT CODES: Process file entirely in memory and map to an optimized text path URL string
    if (req.file) {
      const shortFormAvatarUrl = generateShortImageUrl(req);
      targetProfile.avatar = shortFormAvatarUrl; // 🎯 Stores: https://vercel.app
      console.log("📸 New short-form avatar URL generated successfully.");
    }

    // Process nested schema objects safely from multi-part fields
    let parsedAddress = null;
    if (address) {
      try {
        parsedAddress = parseAddressField(address);
      } catch (parseError) {
        return res.status(400).json({ error: parseError.message });
      }
    }

    // Bind fields to schema structures safely 
    if (bio !== undefined) targetProfile.bio = bio.trim();
    if (gender !== undefined) targetProfile.gender = gender;

    // Prevent empty string date-casting crashes by assigning null
    if (dateOfBirth !== undefined) {
      targetProfile.dateOfBirth = (dateOfBirth === "" || dateOfBirth === null) ? null : new Date(dateOfBirth);
    }

    if (parsedAddress) {
      targetProfile.address = {
        street: parsedAddress.street !== undefined ? parsedAddress.street.trim() : (targetProfile.address?.street || ""),
        city: parsedAddress.city !== undefined ? parsedAddress.city.trim() : (targetProfile.address?.city || ""),
        state: parsedAddress.state !== undefined ? parsedAddress.state.trim() : (targetProfile.address?.state || ""),
        zipCode: parsedAddress.zipCode !== undefined ? parsedAddress.zipCode.trim() : (targetProfile.address?.zipCode || ""),
        country: parsedAddress.country !== undefined ? parsedAddress.country.trim() : (targetProfile.address?.country || "")
      };
    }

    const updatedProfile = await targetProfile.save();
    return res.status(200).json({ success: true, data: updatedProfile });

  } catch (error) {
    console.error("❌ Fatal breakdown inside updateProfile runtime engine:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

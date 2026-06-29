import Profile from "../models/profileSchema.js";

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
// ✅ GET PROFILE CONTROLLER (Database Server Linked)
// ====================================================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. User session token missing." });
    }

    let profile = await Profile.findOne({ user: userId }).populate(
      "user",
      "fullname email mobileNumber role"
    );

    // Self-healing skeleton block to avoid empty profiles on initialization
    if (!profile) {
      const newProfileShell = new Profile({
        user: userId,
        avatar: "",
        bio: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        gender: "prefer not to say"
      });
      await newProfileShell.save(); // Writes to your remote Atlas database server

      profile = await Profile.findOne({ user: userId }).populate(
        "user",
        "fullname email mobileNumber role"
      );
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Profile fetch database error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ====================================================
// ✅ UPDATE PROFILE CONTROLLER (Database Server Upload)
// ====================================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Validation failed." });
    }

    const { bio, dateOfBirth, gender, address } = req.body;
    
    let targetProfile = await Profile.findOne({ user: userId });
    if (!targetProfile) targetProfile = new Profile({ user: userId });

    // 🎯 DATABASE SERVER DIRECT WRITING LAYER: 
    // Converts your RAM buffer to a clean Base64 URL string and assigns it straight to your Atlas schema.
    // This bypasses file directories entirely, preventing folder errors!
    if (req.file) {
      const base64Avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      targetProfile.avatar = base64Avatar; 
      console.log("📸 Avatar data generated for database server storage.");
    }

    let parsedAddress = null;
    if (address) {
      try {
        parsedAddress = parseAddressField(address);
      } catch (parseError) {
        return res.status(400).json({ error: parseError.message });
      }
    }

    if (bio !== undefined) targetProfile.bio = bio.trim();
    if (gender !== undefined) targetProfile.gender = gender;

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

    // Comit data changes straight to your cloud server database
    const updatedProfile = await targetProfile.save();
    return res.status(200).json({ success: true, data: updatedProfile });

  } catch (error) {
    console.error("❌ Profile persistence breakdown on database server:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

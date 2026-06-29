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
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const userId = req.user.id;

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({
        user: userId,
      });
    }

    // Save image in MongoDB Atlas
    if (req.file) {
      profile.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;
    }

    profile.bio = req.body.bio || "";
    profile.gender = req.body.gender || "prefer not to say";

    if (req.body.dateOfBirth) {
      profile.dateOfBirth = req.body.dateOfBirth;
    }

    if (req.body.address) {
      profile.address = JSON.parse(req.body.address);
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

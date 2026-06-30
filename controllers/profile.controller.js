import Profile from "../models/profileSchema.js";

const parseAddress = (address) => {
  if (!address) return undefined;

  if (typeof address === "string") {
    return JSON.parse(address);
  }

  return address;
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", "fullname email");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const avatarUrl = profile.avatar?.data
  ? `${req.protocol}://${req.get("host")}/profile/avatar/${profile._id}`
  : null;

res.json({
    success:true,
    data:{
        _id:profile._id,
        bio:profile.bio,
        gender:profile.gender,
        address:profile.address,
        dateOfBirth:profile.dateOfBirth,
        user:profile.user,
        avatar:avatarUrl
    }
})
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({ user: userId });
    }

    if (req.file) {
      profile.avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
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

    res.status(200).json({
      success: true,
      message: "Profile Updated",
      data: profile,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getAvatar = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile || !profile.avatar || !profile.avatar.data) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    res.set("Content-Type", profile.avatar.contentType);

    res.send(profile.avatar.data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
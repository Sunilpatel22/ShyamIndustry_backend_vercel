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
    const userId = req.user.id;

    let profile = await Profile.findOne({ user: userId }).populate(
      "user",
      "fullname email mobileNumber role"
    );

    if (!profile) {
      profile = await Profile.create({
        user: userId,
      });

      profile = await Profile.findById(profile._id).populate(
        "user",
        "fullname email mobileNumber role"
      );
    }

    const profileObj = profile.toObject();

    if (profileObj.avatar?.data) {
      profileObj.avatar = `data:${profileObj.avatar.contentType};base64,${Buffer.from(
        profileObj.avatar.data
      ).toString("base64")}`;
    } else {
      profileObj.avatar = "";
    }

    return res.status(200).json({
      success: true,
      data: profileObj,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await Profile.findOne({
      user: userId,
    });

    if (!profile) {
      profile = new Profile({
        user: userId,
      });
    }

    if (req.file) {
      profile.avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    profile.bio = req.body.bio || "";

    profile.gender =
      req.body.gender || "prefer not to say";

    if (req.body.dateOfBirth) {
      profile.dateOfBirth = req.body.dateOfBirth;
    }

    if (req.body.address) {
      profile.address = parseAddress(req.body.address);
    }

    await profile.save();

    const profileObj = profile.toObject();

    if (profileObj.avatar?.data) {
      profileObj.avatar = `data:${profileObj.avatar.contentType};base64,${Buffer.from(
        profileObj.avatar.data
      ).toString("base64")}`;
    } else {
      profileObj.avatar = "";
    }

    return res.status(200).json({
      success: true,
      data: profileObj,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // Ensures a one-to-one relationship per user
    },
    avatar: {
      type: String,
      default: "" // URL to the profile image
    },
    bio: {
      type: String,
      maxLength: [500, "Bio cannot exceed 500 characters"],
      default: ""
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "" }
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
      default: "prefer not to say"
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt fields
  }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

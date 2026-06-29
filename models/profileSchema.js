import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  avatar: {
    type: String,
    default: ""
},

  bio: {
    type: String,
    default: "",
    maxLength: 500,
  },

  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "" },
  },

  dateOfBirth: Date,

  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer not to say"],
    default: "prefer not to say",
  },
}, {
  timestamps: true,
});

export default mongoose.model("Profile", profileSchema);
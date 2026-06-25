import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\d{10}$/, "Please fill a valid 10-digit mobile number"] // Custom regex verification rule
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"          
    }
});

// Asynchronous Pre-Save Password Hashing Hook
userSchema.pre('save', async function() {
    const person = this;
    if (!person.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(person.password, salt);
        person.password = hashedPassword;
    } catch (error) {
        throw error;
    }
});

// ✅ Secure, Error-Proof Password Verification Method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model("User", userSchema);
export default User;

import jwt from 'jsonwebtoken';



export const jwtAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.authentication;
    
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header not found" });
    }

    const tokenParts = authHeader.split(' ');
    const token = tokenParts[1];
    
    if (!token) {
        return res.status(401).json({ error: "Token not found in header" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shyam_industries_fallback_secret_key_123');
        
        // 💡 FIX: Safely assign the decoded ID to req.user.id
        req.user = {
            id: decoded.id || decoded._id, 
            fullname: decoded.fullname
        };
        
        next();
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ====================================================
// ✅ FIXED GENERATE TOKEN METHOD
// ====================================================
export const generateToken = (userData) => {
    if (!userData) {
        throw new Error("Token generation failed: userData is empty");
    }

    // 1. Unify database documents vs plain request payload objects
    const rawData = typeof userData.toObject === 'function' ? userData.toObject() : userData;

    // 2. Build an explicitly mapped payload object (Extract only clean strings)
    const cleanPayload = {
        id: rawData._id || rawData.id, // Fallback captures both variations safely
        fullname: rawData.fullname
    };

    // 3. Fallback secret token signature protection prevents system core crashes
    const secretKey = process.env.JWT_SECRET || 'shyam_industries_fallback_secret_key_123';

    // 4. Sign the explicitly isolated clean object container
    return jwt.sign(cleanPayload, secretKey, { expiresIn: '1d' });
};

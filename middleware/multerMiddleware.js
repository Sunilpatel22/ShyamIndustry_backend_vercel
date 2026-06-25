import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import os from 'os';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 🎯 VERCEL COMPATIBILITY: Use /tmp on Vercel/Production, local uploads/ on localhost
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    const baseDir = isProduction ? os.tmpdir() : 'uploads';
    
    // Determine subfolder dynamically based on the field name
    const subDir = file.fieldname === 'profile_image' ? 'profileImage' : '';
    const targetDir = path.join(baseDir, subDir);

    // Self-healing directory check
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, bytes) => {
      if (err) return cb(err);
      const fn = bytes.toString('hex') + path.extname(file.originalname);
      cb(null, fn);
    });
  }
});

export const upload = multer({ storage: storage });

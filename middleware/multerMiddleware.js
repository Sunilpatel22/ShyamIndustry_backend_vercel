import multer from 'multer';

// 🎯 MONGO ATLAS ENGINE: Use memory storage to process files directly into raw RAM buffers
const storage = multer.memoryStorage();

// Safe file verification inspector
const fileFilter = (req, file, cb) => {
  // Accepts only standard visual image formats (png, jpeg, webp, etc.)
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only standard image files are allowed!'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // 🎯 PROTECTION LAYER: Restricts images to 5MB max. 
    // This keeps your MongoDB Atlas network requests lightweight and lightning fast!
    fileSize: 5 * 1024 * 1024 
  }
});

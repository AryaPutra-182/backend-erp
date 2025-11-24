const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Format nama file: TIME-NAMAASLI.ext
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung (Hanya JPG, PNG, PDF)'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 1024 * 1024 * 5 } // Max 5MB
});

module.exports = upload;
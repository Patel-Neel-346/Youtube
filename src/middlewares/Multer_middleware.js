import multer from 'multer';
// import path from 'path';

// Configure multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,"./public/temp"); // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);}
});

// Export the multer instance
const upload = multer({ storage });

export default upload;
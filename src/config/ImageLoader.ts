import multer from "multer";

const storage = multer.memoryStorage();

// const upload = multer({
//   storage
// });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 🎯 Bumps the individual file limit up to 50MB
  },
});

export default upload;
const multer = require("multer");
const path = require("path");

module.exports = function (UPLOADS_FOLDER) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER); // ✅ Use the provided destination folder
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();

      cb(null, filename + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 20 * 1024 * 1024, // ✅ 20MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/heic", "image/heif"];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only jpg, png, jpeg, heic, heif formats are allowed!"));
      }
    },
  });

  return upload; // ✅ Return multer instance
};

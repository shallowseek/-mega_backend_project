import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp/")
      //cb means callback
    },
    filename: function (req, file, cb) {
        console.log("Saving file:", file.originalname);
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ // ← This entire configured multer instance
    storage, 
})
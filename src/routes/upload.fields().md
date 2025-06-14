######
###
#####
####
`upload.fields()` is a **Multer middleware method** that handles multiple file uploads with different field names in a single request.

## What it does:
Allows you to upload different types of files to different fields in one form submission.

## Syntax:
```javascript
upload.fields([
    { name: 'fieldName1', maxCount: 1 },
    { name: 'fieldName2', maxCount: 1 }
])
```

## Example Usage:

### 1. **Basic Setup:**
```javascript
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage });
```

### 2. **Using upload.fields():**
```javascript
// Route with multiple file fields
router.post('/register', 
    upload.fields([
        { name: 'avatar', maxCount: 1 },      // Single avatar image
        { name: 'coverImage', maxCount: 1 }   // Single cover image
    ]), 
    registerUser
);
```

### 3. **In your controller:**
```javascript
const registerUser = (req, res) => {
    console.log(req.files);
    // req.files structure:
    // {
    //     avatar: [{ filename: 'avatar.jpg', path: '/temp/avatar.jpg', ... }],
    //     coverImage: [{ filename: 'cover.jpg', path: '/temp/cover.jpg', ... }]
    // }
    
    // Access files:
    const avatarFile = req.files?.avatar?.[0];      // First (and only) avatar file
    const coverFile = req.files?.coverImage?.[0];   // First (and only) cover file
    
    if (avatarFile) {
        console.log('Avatar uploaded:', avatarFile.filename);
    }
    
    if (coverFile) {
        console.log('Cover image uploaded:', coverFile.filename);
    }
};
```

## Different Multer Methods:

### **Single file:**
```javascript
upload.single('avatar')  // One file in 'avatar' field
// req.file = { filename: '...', path: '...', ... }
```

### **Multiple files (same field):**
```javascript
upload.array('photos', 5)  // Up to 5 files in 'photos' field
// req.files = [{ filename: '...' }, { filename: '...' }, ...]
```

### **Multiple fields:**
```javascript
upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'photos', maxCount: 5 }
])
// req.files = {
//     avatar: [{ filename: '...' }],
//     photos: [{ filename: '...' }, { filename: '...' }]
// }
```

## HTML Form Example:
```html
<form enctype="multipart/form-data" method="POST">
    <input type="file" name="avatar" accept="image/*">
    <input type="file" name="coverImage" accept="image/*">
    <input type="text" name="username">
    <input type="email" name="email">
    <button type="submit">Register</button>
</form>
```

## Key Points:

- **`maxCount`**: Maximum number of files for that field
- **Field names must match** the form input names
- **Files go to `req.files`** (object with arrays)
- **Text fields go to `req.body`** (as usual)
- **Each field becomes an array** even if maxCount is 1

So `upload.fields()` lets you handle multiple different file inputs in one request!












#####
####
####
##

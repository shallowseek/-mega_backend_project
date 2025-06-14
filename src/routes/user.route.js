import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
// all routes will get pefixed with /users/

router.route("/register").post(
    upload.fields([
    // /upload.fields() is a Multer middleware method that handles
        //  multiple file uploads with different field names in a single request.


        // upload.fields() is a method from Multer, a middleware for
        //  handling multipart/form-data (file uploads) in Express.js. 
        // It's specifically designed to handle multiple file uploads with different field names.
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

// router.route("/register").get((req, res) => {
//     console.log("hi");
//     res.json({ message: "Registration endpoint" });
//     //won;t generate refresh token just for register.
// });




//login route , we don't need middleware since we are not storing any uploaded data.
router.route("/login").post(loginUser)

// //secured routes
router.route("/logout").post(verifyJWT,  logoutUser)//since we have cookie parser we can directly access cokies in req.cookies.
//verifyJWT is a middleware
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

//to verify jwt we can sent token either through cookir or headers.
router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router
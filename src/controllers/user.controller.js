import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import path from 'path';


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        console.log("Found user:", user); // Add this
        
        const accessToken = user.generateAccessToken()
        console.log("Generated access token:", accessToken); // Add this
        
        const refreshToken = user.generateRefreshToken()
        console.log("Generated refresh token:", refreshToken); // Add this
        
        user.refreshToken = refreshToken
        console.log("we updated the new refresh token in database")
        await user.save({ validateBeforeSave: false })
        //using validate:flase becuas every filed will start getting validated and here we are just passing refresh token.
        console.log("we have now saved the new value of refrsh token in database")
        return {accessToken, refreshToken}
// The {} creates an object with the tokens as properties.

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    console.log("email: ", email);
///on ptinting passwod it should be empty.
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
//check whther someoe has taken that username and email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
        // returns first matched document
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log("request.files",req.files);

    const avatarFilePath = req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0
    ? req.files.avatar[0].path
    : null;

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log("your avatarFilePath is: ",avatarLocalPath)

    const absoluteAvatarPath = path.resolve(avatarFilePath);//it always return string even undefiend in string.
    console.log("this is the absolute path of avatar",absoluteAvatarPath)

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    const absoluteCoverImagePath = path.resolve(coverImageLocalPath)
    console.log("this is the absolute path of cover image",absoluteCoverImagePath)

    if (!absoluteAvatarPath) {
        throw new ApiError(400, "Avatar file path is required")
    }

    const avatar = await uploadOnCloudinary(absoluteAvatarPath)
    console.log("here is the avatar=====",avatar)
    const coverImage = await uploadOnCloudinary(absoluteCoverImagePath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is not uploaded")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
    console.log("this is newly created row in database",user)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //save refreshToken in database
    //send cookies but secure cookies.


        console.log("req.body:", req.body); // Add this line
    console.log("Content-Type:", req.headers['content-type']); // Add this line

    const {email, username, password} = req.body
    // since we are sending json,it will be available.
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({//findone will find first instance of that.
        // we need to find username and email in dadtabase to validate that user has registered.
        $or: [{username}, {email}]
    })
    console.log("this is the user._id", user._id)

    if (!user) {
        throw new ApiError(404, "User does not exist! Please register First ✌️")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)
   //small user because here we are applying method to instance of that User model.
   // we have created method for user.schema in models.js so therfore we can use that method in user object.

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials, Wrong Password!!!!!!")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    console.log("here is the final logged in user after generating refresh token",loggedInUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    // .cookie() sets HTTP cookies in the user's browser. It's a way to store data on the client side that gets automatically sent back with future requests.
    .cookie("refreshToken", refreshToken, options)

    
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {c:"cleared refresh token"}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    //frontend use this route to get new access token to access authorises routes and to handle it to user.
    //to validate user once again. 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        console.log("your refresh token matched===",decodedToken)
    
        const user = await User.findById(decodedToken?._id)
        console.log("here is the user we found with your refresh token",user)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
        const newRefreshToken= refreshToken
        console.log("here is the accessTOken=>",accessToken)
        console.log("here is the newrefreshToken",newRefreshToken)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, `your new password is ${newPassword}`, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {user:req.user, username:req.user.username, email:req.user.email, fullName:req.user.fullName},
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {//these are called operators.
                fullName:fullName,
                email: email,
            }
        },
        {new: true}//means return updeated statement
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    console.log("the file part created in req object after passing request through upload middleware",req.file)
    //multer middleware ie. upload.singler will first get access to file uploaded in form and will create
    //req.file.

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment,first we have to old delete image from cloudinary 
     const result = await deleteFromCloudinary(req.user.avatar)
     console.log("your operation is successfull",result)

//updating new avatar in cloudinary //
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("the object we got from cloudinary",avatar)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    console.log("the file part created in req object after passing request through upload middleware",req.file)
    //multer middleware ie. upload.singler will first get access to file uploaded in form and will create
    //req.file.

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

     //TODO: delete old image - assignment,first we have to old delete image from cloudinary 
     const result = await deleteFromCloudinary(req.user.coverImage)
     console.log("your operation is successfull",result)



    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("the object we got from cloudinary",coverImage)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})


const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([//aggregate pipleine returns array.
        {
            $match: {
                username: username?.toLowerCase()
//                  Find the user with matching username
// Like SQL: WHERE username = 'john_doe'
            }
        },
        {
            $lookup: {
                from: "subscriptions",  // Join with subscriptions collection
                localField: "_id",  // User's _id
                foreignField: "channel",    // Match with subscription's channel field                
                as: "subscribers"    // Store results in "subscribers" array in that user document as field array.
            }


//             Purpose: Find all subscriptions where this user is the channel (people who subscribed TO this user)
// Like SQL: LEFT JOIN subscriptions ON user._id = subscriptions.channel
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",  // Match with subscription's subscriber field
                as: "subscribedTo"
            }
            // Purpose: Find all subscriptions where this user is the subscriber (channels this user subscribed TO)
        },
        {
            $addFields: {//to add new filed sinto document.
                subscribersCount: {
                    $size: "$subscribers"//size operator to count number
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {//cond is conditional operator.
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
// Purpose: Add calculated fields:

// Count of subscribers
// Count of channels subscribed to
// Whether current user is subscribed to this channel


        },
        {
            $project: {//what to finally give
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
            // Purpose: Select only specific fields to return (like SELECT in SQL)
        }
    ])



    console.log("data type aggregate returns is array",channel)
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    console.log(req.user._id)
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                // When you do a $lookup operation, MongoDB always returns an array, even when there's only one matching document.
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [ 
                    // parameter means each video document will be further processed:
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [ // parameter means each user document will be further processed:
                                {
                                    $project: {//what all details of user document will be finally given.
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
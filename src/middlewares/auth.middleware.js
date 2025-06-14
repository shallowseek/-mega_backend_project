import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log("here is the token we found in your cookie======>>",token);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // You’re verifying and decoding a JWT (JSON Web Token). If the token is valid and not expired, decodedToken will be a JavaScript object containing the payload (the data you put into the token when you signed it).
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        console.log("this is the user after verifying", user)
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;// here we are creating and updatig the user in request.
        next()//next means move to logoutUser function
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})
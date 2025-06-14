import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});



const getPublicIdFromUrl = (url) => {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1]; // "image.jpg"
    const publicId = publicIdWithExtension.split('.')[0]; // "image"
    
    // If there's a folder structure:
    const folderIndex = parts.indexOf('upload') + 2; // Skip version number
    const fullPath = parts.slice(folderIndex).join('/');
    return fullPath.split('.')[0]; // Remove extension
};



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        // fs.unlinkSync(localFilePath)//for deleting sended files.
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


// Delete function
const deleteFromCloudinary = async (publicURL) => {
        try {
        const publicID = await getPublicIdFromUrl(publicURL)
        const result = await cloudinary.uploader.destroy(publicID);
        console.log("Delete result:", result);
        return result;
    } catch (error) {
        console.log("Error deleting from cloudinary:", error);
        throw error;
    }
};

// Typical result object:
// {
//     result: "ok",           // Status: "ok" = success, "not found" = image doesn't exist
//     partial: false          // Whether operation was partial (for bulk operations)
// }





export {uploadOnCloudinary,deleteFromCloudinary}
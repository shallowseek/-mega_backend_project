import mongoose from 'mongoose';
import { DB_NAME} from '../constants.js';

const connectDB = async ()=>{
       try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);//mongoose return an object
        // connectionInstance = await JSON.parse(connectionInstance);// won't work because
        // mongoose.connect() returns a Mongoose object, not a JSON string. Using JSON.parse() on it will cause an error.
        // console.log("✅ Database connected successfully!",connectionInstance); 
        return connectionInstance                
    } 

    catch(error) {
        console.log("❌ Database connection error:", error);
        process.exit(1); // Exit if database connection fails
    }
}

export default connectDB
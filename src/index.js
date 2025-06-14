// import mongoose from 'mongoose'; // Fixed typo
import dotenv from 'dotenv';
import express from 'express'; // Removed unused 'application'
// import { DB_NAME } from './constants.js'; // Added .js extension
dotenv.config({
    path:'./.env'
}); // Consistent import style {path:'./env'}
import connectDB from './db/index.js'
import {app} from './app.js'

//so basically app is our web server so what we want to do is that when DB loads, we want web server ie app to start listening on port.
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        
        // Start the server
        const server = app.listen(PORT, () => {
//             app.listen() is NOT a blocking/continuous function!
// app.listen() does NOT block the execution of subsequent code. Here's what actually happens:
            console.log("✅ Database connected successfully!");
            console.log("✅ Server running on port:", PORT);
            // console.log(server)
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`❌ Port ${PORT} is already in use`);
            } else {
                console.log("❌ Server error:", error);
            }
            process.exit(1);
        });

        // Handle app-level errors
        app.on('error', (error) => {
            console.log("❌ App error:", error);
            throw error;
        });
    })
    .catch((error) => {
        console.log("❌ Failed to start application:", error);
        process.exit(1);
    });








// const app = express(); // Define app before using it

// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log("✅ Database connected successfully!");
        
//         // Start server after successful DB connection
//         const PORT = process.env.PORT || 3000;
//         app.listen(PORT, () => {
//             console.log(`✅ Server running on port ${PORT}`);
//         });
        
//     } catch(error) {
//         console.log("❌ Database connection error:", error);
//         process.exit(1); // Exit if database connection fails
//     }
// })();

// // Handle app-level errors
// app.on("error", (error) => {
//     console.log("❌ App error:", error);
//     throw error;
// });
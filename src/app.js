import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"

// CORS - Handles cross-origin requests
// express.json() - Parses JSON request bodies
// express.urlencoded() - Parses form data
// express.static() - Serves static files
// cookieParser() - Parses cookies





 const app = express()

 app.use(cors({
    origin:process.env.CORS_ORIGIN,    
    //   origin: true,  // Allows any origin
    credentials:true,

//     // With credentials: true
// fetch('http://api.example.com/data', {
//   credentials: 'include'  // Cookies will be sent

 }))

 app.use(express.json({
    limit:"16kb",
    //     // Without express.json(), req.body would be undefined
    // console.log(req.body); // Now contains parsed JSON object

 }))

 app.use(express.urlencoded({
    extended:true,
    limit:'16kb',
 }))

 app.use(express.static("public"))

 app.use(cookieParser())
//  What app.use(cookieParser()) Does
// cookieParser() is middleware that parses cookies from incoming requests and makes them available in req.cookies.


 // Your error handling middleware (probably in app.js)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(statusCode).json({
        success: false,
        message: message,
        statusCode: statusCode
    });
});




 //routes

 import userRouter from './routes/user.route.js'
//routes declaration
app.use("/api/v1/users/", userRouter)

 


 export {app}








//  Great question! Let me break down what `const app = express()` creates and what it contains.

// ## What is `app`?

// When you call `express()`, it returns an **Express application instance** - this is essentially your web server application object. Think of it as your main application that will handle all HTTP requests and responses.## Simple Analogy:

// Think of `app = express()` like creating a **restaurant**:

// ```javascript
// const app = express(); // Create a new restaurant

// // Add menu items (routes)
// app.get('/menu', showMenu);        // GET request = "Show me the menu"
// app.post('/order', takeOrder);     // POST request = "Take my order"
// app.put('/order/:id', updateOrder); // PUT request = "Change my order"

// // Add staff (middleware)
// app.use(welcomeCustomers);   // Greet everyone who enters
// app.use(checkReservation);   // Check if they have a reservation
// app.use(seatCustomers);      // Show them to their table

// // Start the restaurant (server)
// app.listen(3000, () => {
//     console.log('Restaurant open on port 3000!');
// });
// ```

// ## Key Points:

// 1. **`app` is a function** - It can process HTTP requests
// 2. **`app` is an object** - It has methods and properties
// 3. **`app` manages routing** - Decides which code runs for which URL
// 4. **`app` handles middleware** - Processes requests in order
// 5. **`app` is configurable** - You can customize its behavior

// ## What happens when you call `app.listen()`?

// ```javascript
// app.listen(3000) // This:
// // 1. Creates an HTTP server
// // 2. Passes the 'app' function as the request handler
// // 3. Starts listening on port 3000
// // 4. When requests come in, calls app(req, res)
// ```

// So `app` is essentially your **entire web application** - it contains all your routes, middleware, settings, and the logic to handle incoming HTTP requests and send back responses!
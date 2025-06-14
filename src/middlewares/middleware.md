###
    Middleware is a function that runs before your final response is sent to the user.

It can:

    Check something (like authentication)

    Log data

    Modify the request or response

    Stop or continue the flow

    app.use((req, res, next) => {
  console.log('New request received!');
  next(); // move to the next handler
});This runs for every request.




⚙️ You can also target specific routes:

app.use('/api', (req, res, next) => {
  console.log('Middleware only for /api route');
  next();
});



Real-Life Analogy:

Imagine a request goes through security checks before reaching the final desk:

Request --> Security Check 1 --> Security Check 2 --> Final Action
              (app.use)            (app.use)          (app.get)

Each checkpoint is a middleware. They say:

next(); // move to the next step

🧪 Example with Route:

app.use((req, res, next) => {
  console.log('Middleware before route');
  next(); // continue to the next handler
});

app.get('/', (req, res) => {
  res.send('Hello from final route!');
});

If you remove next(), the route handler won't run!
✅ Summary
Term	Meaning
app.use()	Register a middleware function
next()	Tell Express to move to the next function or route

Would you like a step-by-step demo where we log request info using app.use() before sending a response?


###
next() is a function you call to say:

    “I’m done here, move to the next middleware or route.”

If you don’t call next(), the request stops there and never reaches the final res.send().










###
`cookie-parser` is a middleware package for Express.js that **parses cookies** from incoming HTTP requests and makes them easily accessible in your application.

## What are cookies?

Cookies are small pieces of data that websites store in your browser. They're sent back and forth between the browser and server with every HTTP request.

## What does cookie-parser do?## Installation:

```bash
npm install cookie-parser
```

## Basic Usage:

```javascript
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

// Use cookie-parser middleware
app.use(cookieParser());

// Now you can access cookies
app.get('/', (req, res) => {
    console.log(req.cookies); // All cookies as an object
    res.send('Cookies parsed!');
});
```

## What happens WITHOUT cookie-parser:

```javascript
// Raw cookie header from browser:
req.headers.cookie = "username=john; theme=dark; sessionId=abc123"

// You'd have to manually parse this string! 😰
```

## What happens WITH cookie-parser:

```javascript
// After using cookieParser() middleware:
req.cookies = {
    username: 'john',
    theme: 'dark', 
    sessionId: 'abc123'
}

// Easy to access! 😊
const username = req.cookies.username;
```

## Common Use Cases:

### 1. **User Authentication**
```javascript
// Set auth token in cookie
res.cookie('authToken', 'jwt-token', { httpOnly: true });

// Check auth in protected routes
if (!req.cookies.authToken) {
    return res.status(401).send('Not authenticated');
}
```

### 2. **User Preferences**
```javascript
// Save user theme preference
res.cookie('theme', 'dark', { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

// Apply theme based on cookie
const theme = req.cookies.theme || 'light';
```

### 3. **Session Management**
```javascript
// Set session ID
res.cookie('sessionId', 'unique-session-id');

// Retrieve session
const sessionId = req.cookies.sessionId;
```

## Key Benefits:

1. **Automatic Parsing**: Converts cookie string to JavaScript object
2. **Easy Access**: `req.cookies.cookieName` instead of manual parsing
3. **Signed Cookies**: Tamper-proof cookies with `req.signedCookies`
4. **Security**: Works with secure cookie options

## Cookie Security Options:

```javascript
res.cookie('secure', 'value', {
    httpOnly: true,    // Prevents XSS attacks
    secure: true,      // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000    // 1 hour expiry
});
```

**In summary**: `cookie-parser` makes working with cookies in Express much easier by automatically parsing the cookie header and providing easy access to cookie values through `req.cookies`!


####
`app.use()` is a method to **add middleware** to your Express application. Middleware functions run **between** the request and response - they process requests before they reach your route handlers.

## **What middleware does:**
Think of middleware like **security checkpoints at an airport** - every passenger (request) must pass through them before reaching their destination (route handler).

## **Basic syntax:**
```javascript
app.use(middlewareFunction);
app.use('/path', middlewareFunction);
app.use('/path', middleware1, middleware2, middleware3);
```

## **Simple example:**
```javascript
const express = require('express');
const app = express();

// This middleware runs for EVERY request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date()}`);
    next(); // Must call next() to continue to next middleware/route
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});
```

**Output when you visit `localhost:3000/`:**
```
GET / - Mon Jun 11 2025 10:30:45 GMT+0530
```

## **Common built-in middleware:**

### **1. Parse JSON bodies**
```javascript
app.use(express.json()); // Parses JSON in request body

// Now you can access req.body in your routes
app.post('/users', (req, res) => {
    console.log(req.body); // { name: "John", email: "john@email.com" }
    res.json({ message: 'User created', user: req.body });
});
```

### **2. Parse URL-encoded forms**
```javascript
app.use(express.urlencoded({ extended: true }));

// Now you can handle form submissions
app.post('/contact', (req, res) => {
    console.log(req.body); // { name: "John", message: "Hello" }
});
```

### **3. Serve static files**
```javascript
app.use(express.static('public'));
// Now files in 'public' folder are accessible
// localhost:3000/style.css → serves public/style.css
// localhost:3000/image.jpg → serves public/image.jpg
```

## **Path-specific middleware:**
```javascript
// Only runs for routes starting with '/api'
app.use('/api', (req, res, next) => {
    console.log('API request received');
    next();
});

// Only runs for '/admin' routes
app.use('/admin', (req, res, next) => {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
});

app.get('/api/users', (req, res) => {
    res.json({ users: [] }); // Middleware above runs first
});
```

## **Custom middleware examples:**

### **Authentication middleware:**
```javascript
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token logic here...
    req.user = { id: 123, name: 'John' }; // Add user to request
    next(); // Continue to next middleware/route
};

app.use('/protected', requireAuth); // Apply to all /protected routes

app.get('/protected/profile', (req, res) => {
    res.json({ user: req.user }); // req.user is available because of middleware
});
```

### **Logging middleware:**
```javascript
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

app.use(logger); // Logs every request
```

### **CORS middleware:**
```javascript
const cors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};

app.use(cors); // Enable CORS for all routes
```

## **Third-party middleware:**
```javascript
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

app.use(cors());           // Handle CORS
app.use(morgan('combined')); // HTTP request logger
app.use(helmet());         // Security headers
app.use(express.json());   // Parse JSON bodies
```

## **Middleware execution order:**
```javascript
// Middleware runs in the order you define it

app.use((req, res, next) => {
    console.log('First middleware');
    next();
});

app.use((req, res, next) => {
    console.log('Second middleware');
    next();
});

app.get('/', (req, res) => {
    console.log('Route handler');
    res.send('Hello');
});

// Output for GET /:
// First middleware
// Second middleware
// Route handler
```

## **Important: Always call `next()`**
```javascript
// ❌ Wrong - request hangs forever
app.use((req, res, next) => {
    console.log('Middleware ran');
    // Missing next() - request never continues
});

// ✅ Correct
app.use((req, res, next) => {
    console.log('Middleware ran');
    next(); // Continue to next middleware/route
});

// ✅ Or send response (ends the request)
app.use((req, res, next) => {
    if (someCondition) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});
```

## **Real-world setup:**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Global middleware (runs for all requests)
app.use(cors());                           // Enable CORS
app.use(express.json());                   // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public'));         // Serve static files

// Custom logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

app.listen(3000);
```

**Think of `app.use()` as setting up a pipeline** - every request flows through your middleware functions before reaching the final destination (your route handler)!




###

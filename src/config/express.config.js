// Importing the express from node modules
const express = require("express");
// Importing the mainRouter from the router directory
const mainRouter = require("../router/mainRouter");
// Importing the mongoDB
const mongoDB = require("./mongodb.config")
// Importing the errorHandler
const errorHandler = require("../middleware/error-hander.middleware");
// Importing the cors middleware
const cors = require("cors");
// Importing the express-rate-limit
const { rateLimit } = require("express-rate-limit");
// Importing the helmet.
const helmet = require("helmet");


// Build the instance
const app = express();

// 1. Move this to the VERY TOP before any other app.use
app.set('trust proxy', 1);

// 2. Updated Limiter logic
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 5 minutes"
});

// 3. Security Middlewares
app.use(limiter);
app.use(helmet());

// 4. CORS - Explicitly allow your local frontend if needed
app.use(cors({
    origin: ["http://localhost:5173", "https://blood-bridge-frontend-lilac.vercel.app/"], // Add your origins
    credentials: true
}));

// Rest of your parsers and routers...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/bloodbridge/v1", mainRouter);
app.use(errorHandler);

module.exports = app;

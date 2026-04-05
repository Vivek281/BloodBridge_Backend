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



//Building and instance of express
const app = express()
// defining the rate limit
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
})

app.set('trust proxy', 1);

// applying the rate limit to all routes
app.use(limiter)
// using the helmet middleware
app.use(helmet());
// using the cors middleware
app.use(cors());

// Setting up express parsers for json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Defining the path for mainRouter
app.use("/bloodbridge/v1", mainRouter);

app.use(errorHandler)

module.exports = app


// Importing the express from node modules
const express = require("express");
// Importing the mainRouter from the router directory
const mainRouter = require("../router/mainRouter");
// Importing the mongoDB
const mongoDB = require("./mongodb.config")
// Importing the errorHandler
const errorHandler = require("../middleware/error-hander.middleware");





//Building and instance of express
const app = express()

// Setting up express parsers for json and urlencoded data
app.use(express.json());
app.use(express.urlencoded());

// Defining the path for mainRouter
app.use("/v1", mainRouter);

app.use(errorHandler)

module.exports = app


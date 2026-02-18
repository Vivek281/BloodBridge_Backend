const authRouter = require("./authRouter");
const mainRouter = require("express").Router();

mainRouter.use("/auth",authRouter);

module.exports = mainRouter
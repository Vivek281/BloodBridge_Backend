const authRouter = require("./authRouter");
const mainRouter = require("express").Router();
const bloodRequestRouter = require("./bloodRequestRoutrer")

mainRouter.use("/auth",authRouter);
mainRouter.use("/blood-request", bloodRequestRouter)

module.exports = mainRouter
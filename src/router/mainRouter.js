const authRouter = require("./authRouter");
const mainRouter = require("express").Router();
const bloodRequestRouter = require("./bloodRequestRoutrer");
const donationRouter = require("./donationRouter");

mainRouter.use("/auth",authRouter);
mainRouter.use("/blood-request", bloodRequestRouter);
mainRouter.use("/donation", donationRouter);

module.exports = mainRouter
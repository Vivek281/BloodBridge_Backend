const authRouter = require("express").Router();
const AuthCtrl = require("../controller/AuthController");
const validator = require("../middleware/validator.middleware");
const {RegisterDTO, LoginDTO} = require("../dto/auth.dto")
const loginCheck = require("../middleware/auth.middleware")

//Registration
authRouter.post("/register",validator(RegisterDTO),AuthCtrl.userRegister); 
authRouter.get("/activate/:token", AuthCtrl.activateUser);
authRouter.get("/re-activate/:token", AuthCtrl.resendActivationLink);

//Login
authRouter.post("/login", validator(LoginDTO), AuthCtrl.userLogin);
authRouter.get("/me", loginCheck(), AuthCtrl.getLoggedInUserProfile);

module.exports = authRouter;

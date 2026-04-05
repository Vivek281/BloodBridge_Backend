const authRouter = require("express").Router();
const AuthCtrl = require("../controller/AuthController");
const validator = require("../middleware/validator.middleware");
const {RegisterDTO, LoginDTO, UpdateDTO} = require("../dto/auth.dto")
const loginCheck = require("../middleware/auth.middleware")
const uploader = require("../middleware/uploader.middleware")

//Registration
authRouter.post("/register",uploader().none(),validator(RegisterDTO),AuthCtrl.userRegister); 
authRouter.get("/activate/:token", AuthCtrl.activateUser);
authRouter.get("/re-activate/:token", AuthCtrl.resendActivationLink);

//Login
authRouter.post("/login", validator(LoginDTO), AuthCtrl.userLogin);
authRouter.get("/me", loginCheck(), AuthCtrl.getLoggedInUserProfile);   // Private Route

authRouter.patch("/me", loginCheck(),uploader().none(),validator(UpdateDTO), AuthCtrl.updateUserProfile);

authRouter.patch("/setFCM", loginCheck(),uploader().none(), AuthCtrl.setFCM); 
//LogOut
authRouter.get("/logout", loginCheck(), AuthCtrl.logout)

module.exports = authRouter;

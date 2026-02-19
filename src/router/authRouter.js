const authRouter = require("express").Router();
const AuthCtrl = require("../controller/AuthController");
const validator = require("../middleware/validator.middleware");
const {RegisterDTO} = require("../dto/auth.dto")


authRouter.post("/register",validator(RegisterDTO),AuthCtrl.userRegister); 


module.exports = authRouter;
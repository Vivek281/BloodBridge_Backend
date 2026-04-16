const donationRouter = require("express").Router();
const loginCheck = require("../middleware/auth.middleware");
const DonationCtrl = require("../controller/DonationController")

donationRouter.get("/donor/:id", loginCheck(), DonationCtrl.getDonor);
donationRouter.patch("/cannot-make-it/:id", loginCheck(), DonationCtrl.cannotMakeIt);

module.exports = donationRouter;
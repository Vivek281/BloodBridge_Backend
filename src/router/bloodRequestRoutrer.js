const bloodRequestRouter = require("express").Router();
const BloodRequestCtrl = require("../controller/BloodRequestController");
const validator = require("../middleware/validator.middleware");
const loginCheck = require("../middleware/auth.middleware");
const uploader = require("../middleware/uploader.middleware");
const { CreateBloodRequestDTO } = require("../dto/bloodRequest.dto")

bloodRequestRouter.post("/create-request", loginCheck(),uploader().single("healthReport"),validator(CreateBloodRequestDTO), BloodRequestCtrl.createRequest);
bloodRequestRouter.get("/profile", loginCheck(), BloodRequestCtrl.getRequestWithDonorId);
bloodRequestRouter.get("/my-request-detail", loginCheck(), BloodRequestCtrl.myRequestDetail);
bloodRequestRouter.get("/:id", loginCheck(), BloodRequestCtrl.getRequest);
bloodRequestRouter.post("/:id/accept", loginCheck(), BloodRequestCtrl.acceptRequest);
bloodRequestRouter.patch("/fulfill", loginCheck(), BloodRequestCtrl.requestFulfilled);

module.exports = bloodRequestRouter

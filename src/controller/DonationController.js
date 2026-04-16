const donationService = require("../services/donation.service");
const bloodRequestService = require("../services/bloodRequest.service");
const userService = require("../services/user.service");
const { RequestStatus } = require("../config/constants");
const notificationService = require("../services/notification.service")

class DonationController {
    getDonor = async (req, res, next) => {
        try {
            const id = req.params.id;
            let filter = { _id: id };
            const donorDetail = await donationService.getSingleRowByFilter(filter);
            if (!donorDetail) {
                throw {
                    code: 404,
                    message: "Donor not found",
                    status: "BLOOD_REQUEST_NOT_FOUND_ERR",
                };
            }
            res.json({
                data: donorDetail,
                message: "Donor Detail.",
                status: "OK"
            })
        } catch (exception) {
            next(exception);
        }
    }

    cannotMakeIt = async (req, res, next) => {
        try {
            const requestId = req.params.id;
            const donorId = req.loggedInUser._id;
    
            // 1. Find the request first to get the donation ID
            const currentRequest = await bloodRequestService.getSingleRowByFilter({ _id: requestId });
            
            if (!currentRequest) {
                return res.status(404).json({ message: "Request not found." });
            }
    
            const requester = await userService.getSingleUserByFilter({_id: currentRequest.requestedBy});

            const donationIdToFail = currentRequest.acceptedDonationId;
    
            // 2. Update the Request (Reset everything here)
            await bloodRequestService.updateSingleRowByFilter(
                { _id: requestId },
                { 
                    status: RequestStatus.PENDING,
                    acceptedDonationId: null // Clean slate for the next donor
                }
            );
    
            // 3. Update the Donor (Release them)
            await userService.operatorNeutralUpdateSingleRowByFilter(
                { _id: donorId },
                {
                    $set: {
                        "availability.isAvailable": true,
                        "availability.activeRequestId": null
                    }
                }
            );
    
            // 4. Update the Donation Record
            if (donationIdToFail) {
                await donationService.updateSingleRowByFilter(
                    { _id: donationIdToFail },
                    { status: "failed" }
                );
            }
            // 5. Notify the requester
            await this.notifyRequester(requester);
    
            res.json({
                message: "Donation cancelled. Request is back in the pool.",
                status: "CANCEL_SUCCESS"
            });
    
        } catch (exception) {
            next(exception);
        }
    }

    notifyRequester = async(requester) => {
        try{
            if (requester?.fcmTokens?.length > 0) {
                await notificationService.sendNotificationWithOutData(requester.fcmTokens, {
                    title: "Donor Could Not Make It! 🩸",
                    body: "The donor was unable to fulfill the request. We have made the request public again. "
                });
            }
        }catch(exception){
            console.log("Notification Operator Error:", exception);
        }
    }
}

module.exports = new DonationController();
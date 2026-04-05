const bloodRequestService = require("../services/bloodRequest.service")
const notificationService = require("../services/notification.service")
const donationService = require("../services/donation.service");
const userService = require("../services/user.service");
class BloodRequestController {
    createRequest = async (req, res, next) => {
        try {
            const data = await bloodRequestService.transformForBloodRequest(req);
            const bloodRequest = await bloodRequestService.store(data);
            const donors = await bloodRequestService.findDonor(bloodRequest);

            const tokens = donors
                .map(donor => donor.fcmTokens)
                .flat()
                .filter(token => !!token);

            if (tokens && tokens.length > 0) {
                // Notifications are sent
                const message = await notificationService.sendNotification(tokens, bloodRequest);

                return res.json({
                    data: { response: message, requestId: bloodRequest._id, notifiedCount: tokens.length },
                    message: `Request created and ${tokens.length} nearby donors notified.`,
                    status: "REQUEST_CREATED"
                });
            } else {
                // No donors found - Success but with a warning status
                return res.json({
                    data: { requestId: bloodRequest._id, notifiedCount: 0 },
                    message: 'Request created, but no matching donors were found in your area.',
                    status: "NO_DONORS_FOUND"
                });
            }

        } catch (exception) {
            // This handles real system crashes (Database down, Firebase error, etc.)
            next(exception);
        }
    }

    getRequest = async (req, res, next) => {
        try {
            const id = req.params.id;
            let filter = { _id: id };
            const bloodRequestDetail = await bloodRequestService.getSingleRowByFilter(filter);
            if (!bloodRequestDetail) {
                throw {
                    code: 404,
                    message: "Blood Request not found",
                    status: "BLOOD_REQUEST_NOT_FOUND_ERR",
                };
            }
            res.json({
                data: bloodRequestDetail,
                message: "Blood Request Detail.",
                status: "OK"
            })
        } catch (exception) {
            next(exception);
        }
    }

    acceptRequest = async (req, res, next) => {
        try {
            const requestId = req.params.id;
            const donorId = req.loggedInUser._id;
            const filter = { _id: requestId, status: "pending" };
    
            // 1. Lock the request
            const updatedRequest = await bloodRequestService.updateSingleRowByFilter(
                filter,
                { status: "accepted" }
            );
    
            if (!updatedRequest) {
                return res.status(400).json({
                    message: "Request no longer available.",
                    status: "UNAVAILABLE"
                });
            }
    
            // 2. Create Donation Record
            const donation = await donationService.createDonation({
                donor: donorId,
                request: requestId,
                status: "accepted",
                acceptedAt: new Date()
            });
    
            // 3. Link Donation back to Request
            await bloodRequestService.updateSingleRowByFilter({_id:requestId}, {acceptedDonationId:donation._id});

            // 4. Update the Availability.ActiveRequestId of the user who is accepting.
            await userService.updateSingleRowByFilter({_id:donorId}, {"availability.activeRequestId": requestId, "availability.isAvailable": false});
    
            // 5. Notification Logic (Triggered asynchronously)
            await this.notifyRequester(updatedRequest, req.loggedInUser);
    
            res.json({
                data: { request: updatedRequest, donationId: donation._id },
                message: "Acceptance confirmed.",
                status: "ACCEPTANCE_SUCCESS"
            });
    
        } catch (exception) {
            next(exception);
        }
    }
    
    // Private helper within controller to keep the main function clean
    notifyRequester = async (request, donor) => {
        try {
            const requester = await userService.getSingleUserByFilter({_id:request.requestedBy});
            if (requester?.fcmTokens?.length > 0) {
                await notificationService.notifyRequester(requester.fcmTokens, {
                    title: "Donor Found! 🩸",
                    body: `${donor.name} is coming to help with blood group ${request.patientBloodGroup}.`
                },donor);
            }
        } catch (exception) {
            throw(exception);
        }
    }
}

module.exports = new BloodRequestController();
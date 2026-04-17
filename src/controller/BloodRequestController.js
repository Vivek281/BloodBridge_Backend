const bloodRequestService = require("../services/bloodRequest.service")
const notificationService = require("../services/notification.service")
const donationService = require("../services/donation.service");
const userService = require("../services/user.service");
const { RequestStatus, DonationStatus } = require("../config/constants");
class BloodRequestController {
    createRequest = async (req, res, next) => {
        try {
            const data = await bloodRequestService.transformForBloodRequest(req);
            const bloodRequest = await bloodRequestService.store(data);
            const donors = await bloodRequestService.findDonor(bloodRequest);

            const notificationBlock = {
                title: "Urgent Blood Request 🩸",
                body: `Immediate need for ${bloodRequest.patientBloodGroup} at ${bloodRequest.hospitalName}.`
            };
            
            const tokens = donors
                .map(donor => donor.fcmTokens)
                .flat()
                .filter(token => !!token);

            if (tokens && tokens.length > 0) {
                // Notifications are sent
                const message = await notificationService.sendNotificationWithData(tokens, notificationBlock, {
                    requestId: bloodRequest._id.toString(), // The ID from MongoDB
                });

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

    myRequestDetail = async (req, res, next) => {
        try{
            const id = req.loggedInUser._id;
            let filter = {requestedBy: id, status: RequestStatus.PENDING};
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
        }catch(exception){
            next(exception);
        }
    }

    cancelRequest = async (req, res, next) => {
        try{
            const requestId = req.params.id;
            const bloodRequestDetail = await bloodRequestService.getSingleRowByFilter({_id:requestId});
            if(!bloodRequestDetail){
                throw {
                    code: 404,
                    message: "Blood Request not found",
                    status: "BLOOD_REQUEST_NOT_FOUND_ERR",
                };
            }

            if(bloodRequestDetail.acceptedDonationId){
                const donationDetail = await donationService.updateSingleRowByFilter({_id: bloodRequestDetail.acceptedDonationId},{status: DonationStatus.CANCELLED});
                if(!donationDetail){
                    throw {
                        code: 404,
                        message: "Donation Detail not found",
                        status: "DONATION_DETAIL_NOT_FOUND_ERR",
                    };
                }
                const donorId = donationDetail.donor;
                const updatedDonor = await userService.operatorNeutralUpdateSingleRowByFilter({ _id: donorId }, {$set:{ "availability.activeRequestId": null, "availability.isAvailable": true }});
                if (!updatedDonor) {
                    throw { code: 404, message: "No Donor Found to update.", status: "DONOR_NOT_FOUND" };
                }
                await this.notifyDonor(updatedDonor);

            }

            await bloodRequestService.updateSingleRowByFilter({_id: requestId}, { status: RequestStatus.CANCELLED, acceptedDonationId : null });

            res.json({
                message: "Request Canceled Successfully.",
                status: "OK"
            })
        }catch(exception){
            next(exception)
        }
    }

    notifyDonor = async(updatedDonor) => {
        try{
            if (updatedDonor?.fcmTokens?.length > 0) {
                await notificationService.sendNotificationWithOutData(updatedDonor.fcmTokens, {
                    title: "Request Cancled! 🩸",
                    body: "The Requester canceled the request. No need to take any action. "
                });
            }
        }catch(exception){
            console.log("Notification Operator Error:", exception);
        }
    }

    getRequestWithDonorId = async (req, res, next)  => {
        try{
            const donorId = req.loggedInUser._id;
            const donorDetail = await donationService.getSingleRowByFilter({_id:donorId});
            //User Check
            if (!donorDetail) {
                throw { code: 404, message: "Donor not found", status: "DONOR_NOT_FOUND" };
            }
            // ActiveRequestId Check
            if(!donorDetail.availability?.activeRequestId){
                throw{
                    code: 404,
                    message: "User Not Commited to any Request",
                    status: "NOT_COMMITED_TO_ANY_REQUEST_ERR"
                };
            }
            let filter = { _id: donorDetail.availability.activeRequestId}

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

        }catch(exception){
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
            await bloodRequestService.updateSingleRowByFilter({ _id: requestId }, { acceptedDonationId: donation._id });

            // 4. Update the Availability.ActiveRequestId of the user who is accepting.
            await userService.updateSingleRowByFilter({ _id: donorId }, { "availability.activeRequestId": requestId, "availability.isAvailable": false });

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
            const data = {donorId: donor._id.toString()};
            const requester = await userService.getSingleUserByFilter({ _id: request.requestedBy });
            if (requester?.fcmTokens?.length > 0) {
                await notificationService.sendNotificationWithData(requester.fcmTokens, {
                    title: "Donor Found! 🩸",
                    body: `${donor.name} is coming to help with blood group ${request.patientBloodGroup}.`
                }, data);
            }
        } catch (exception) {
            console.error("Notification Operator Error:", exception);
        }
    }


    requestFulfilled = async (req, res, next) => {
        try {
            const requesterId = req.loggedInUser._id;
            const { donorId, bloodGroup } = req.body;

            // 1. Find and Update the Blood Request
            // We look for a request that is currently 'accepted' and belongs to this requester.
            const updatedRequest = await bloodRequestService.updateSingleRowByFilter(
                {
                    requestedBy: requesterId,
                    patientBloodGroup: bloodGroup,
                    status: RequestStatus.ACCEPTED
                },
                { status: "fulfilled" }
            );

            if (!updatedRequest) {
                return res.status(404).json({
                    message: "No active accepted request found to fulfill.",
                    status: "NOT_FOUND"
                });
            }

            // 2. Find and Update the Donation record
            // We link this to the request we just found and the donor ID.
            const updatedDonation = await donationService.updateSingleRowByFilter(
                {
                    request: updatedRequest._id,
                    donor: donorId,
                    status: "accepted"
                },
                { status: "completed", completedAt: new Date() }
            );

            if (!updatedDonation) {
                return res.status(404).json({
                    message: "Associated donation record not found.",
                    status: "DONATION_NOT_FOUND"
                });
            }

            // 3. Update the Donor's availability and history
            // We update the availability object and push the donationId into the array.
            await userService.operatorNeutralUpdateSingleRowByFilter(
                { _id: donorId },
                {
                    // Use $set for standard field updates
                    $set: {
                        "availability.lastDonationDate": new Date(),
                        "availability.activeRequestId": null,
                        "availability.isAvailable": true,
                    },
                    // Use $push for array updates at the SAME level
                    $push: {
                        donationHistory: updatedDonation._id
                    }
                }
            );

            res.json({
                message: "Blood request successfully fulfilled. Donor history updated.",
                status: "FULFILLMENT_SUCCESS",
                data: {
                    requestId: updatedRequest._id,
                    donationId: updatedDonation._id
                }
            });

        } catch (exception) {
            // Log the error for debugging
            console.error("Fulfillment Error:", exception);
            next(exception);
        }
    }

    getRequestList = async (req, res, next) => {
        try{
            const userId = req.loggedInUser._id;
            const userDetail = await userService.getSingleUserByFilter({_id: userId});
    
            let page = +req.query.page || 1
            let limit = +req.query.limit || 20;
    
            const {data, pagination} = await bloodRequestService.getRequestListByUserDetail(userDetail, {page, limit});

            if (!data) {
                return res.status(400).json({
                    message: "No Blood Request found in your area.",
                    status: "UNAVAILABLE"
                });
            }
            res.json({
                data: data, 
                message: "Request Listing",
                status: "OK",
                meta: {
                  pagination
                }
            })
        }catch(exception){
            next(exception);
        }
    }
}

module.exports = new BloodRequestController();
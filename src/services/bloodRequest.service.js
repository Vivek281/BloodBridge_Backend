const { RequestStatus } = require("../config/constants");
const BloodRequestModel = require("../models/BloodRequest.model");
const UserModel = require("../models/User.model");
const cloudinarySvc = require("./cloudinary.config")
class bloodRequestService {
    async transformForBloodRequest(req) {
        try {
            const data = req.body;

            if (data.longitude && data.latitude) {
                data.location = {
                    type: "Point",
                    coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)]
                };
            }
            data.healthReport = null;
            if (req.file) {
                data.healthReport = await cloudinarySvc.uploadSingleFile(req.file.path, "/healthReports")
            }
            data.requestedBy = req.loggedInUser._id;
            return data;
        } catch (exception) {
            throw exception
        }
    }

    async store(data) {
        try {
            const bloodRequest = new BloodRequestModel(data);
            return await bloodRequest.save();
        } catch (exception) {
            throw exception;
        }
    }

    async findDonor(bloodRequest) {
        try {
            const [longitude, latitude] = bloodRequest.location.coordinates;
            const patientBloodGroup = bloodRequest.patientBloodGroup;
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const donors = await UserModel.find({
                _id: { $ne: bloodRequest.requestedBy },
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: 5000 // Distance in meters
                    }
                },
                bloodGroup: patientBloodGroup,
                "availability.isAvailable": true,
                "availability.activeRequestId": null,
                $or: [
                    { "availability.lastDonationDate": null },
                    { "availability.lastDonationDate": { $lte: ninetyDaysAgo } }
                ]
            }).select("fcmTokens").lean();
            return donors;
        } catch (exception) {
            throw exception
        }
    }

    async getSingleRowByFilter(filter) {
        try {
            const data = await BloodRequestModel.findOne(filter)
                .select("healthReport _id requestedBy patientBloodGroup urgency hospitalName phone status acceptedDonationId createdAt").lean();;
            return data;
        } catch (exception) {
            throw exception
        }
    }

    async updateSingleRowByFilter(filter, data) {
        try {
            const updatedBloodRequest = await BloodRequestModel.findOneAndUpdate(filter, { $set: data }, { new: true })
            return updatedBloodRequest;
        } catch (exception) {
            throw (exception)
        }
    }
    // bloodRequest.service.js
    async accept(requestId, donorId) {
        try {
            return await BloodRequestModel.findOneAndUpdate(
                {
                    _id: requestId,
                    status: "pending" // ONLY update if it's still pending
                },
                {
                    $set: {
                        status: "accepted",
                        acceptedBy: donorId,
                        acceptedAt: new Date()
                    }
                },
                { new: true }
            ).populate('requestedBy', 'name phone'); // Populate donor details for the requester
        } catch (exception) {
            throw exception
        }
    }

    async getRequestListByUserDetail(userDetail, config = { page: 1, limit: 20 }) {
        try {
            let skip = (+config.page - 1) * +config.limit;
            const [longitude, latitude] = userDetail.location.coordinates;
            const userBloodGroup = userDetail.bloodGroup;
            const queryFilter = {
                patientBloodGroup: userBloodGroup,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: 5000 // Distance in meters
                    }
                },
                status: RequestStatus.PENDING
            }

            const radiusInRadians = 5 / 6378.1; // 5km converted to radians
            const countFilter = {
                patientBloodGroup: userBloodGroup,
                status: RequestStatus.PENDING,
                location: {
                    $geoWithin: {
                        $centerSphere: [[longitude, latitude], radiusInRadians]
                    }
                }
            };
            const data = await BloodRequestModel.find(queryFilter)
            .select("_id patientBloodGroup hospitalName createdAt")
            .skip(skip)
            .limit(+config.limit);
            const total = await BloodRequestModel.countDocuments(countFilter);

            return {
                data: data,
                pagination: {
                    total: total,
                    limit: +config.limit,
                    page: +config.page,
                    totalNoOfPages: Math.ceil(total / +config.limit),
                },
            };
        } catch (exception) {
            throw exception
        }
    }

}

module.exports = new bloodRequestService
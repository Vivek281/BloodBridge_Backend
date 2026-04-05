const donationService = require("../services/donation.service");

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
}

module.exports = new DonationController();
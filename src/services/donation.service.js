// donation.service.js
const DonationModel = require("../models/Donation.model");
const UserModel = require("../models/User.model");

class DonationService {
    createDonation = async (data) => {
        try {
            const donation = new DonationModel(data);
            return await donation.save();
        } catch (error) {
            throw error;
        }
    }
    async getSingleRowByFilter(filter) {
        try{
            const data = await UserModel.findOne(filter)
            .select("_id name phone address availability bloodGroup donationHistory gender").lean();
            return data;
        }catch(exception){
            throw exception
        }
    }

    async updateSingleRowByFilter(filter, data){
        try{
          const updatedDonation = await DonationModel.findOneAndUpdate(filter, {$set:data}, {new:true})
          return updatedDonation;
        }catch(exception){
          throw(exception)
        }
    }
}

module.exports = new DonationService();
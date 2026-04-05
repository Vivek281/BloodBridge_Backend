const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true
    },

    status: {
      type: String,
      enum: ["accepted", "completed", "failed"],
      default: "accepted"
    },

    acceptedAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const DonationModel = mongoose.model("Donation", DonationSchema);
module.exports = DonationModel;
const mongoose = require("mongoose");
const { BloodGroup, Urgency, RequestStatus } = require("../config/constants");

const BloodRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    patientBloodGroup: {
      type: String,
      enum: Object.values(BloodGroup),
      required: true
    },

    urgency: {
      type: String,
      enum: Object.values(Urgency),
      default: Urgency.MEDIUM
    },

    hospitalName: {
      type: String,
      required: true
    },

    phone: {
        type: String,
        required: true,
      },

    // 📍 Request location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING
    },

    acceptedDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null
    },
    healthReport: {
      publicId: String,
      secureUrl: String,
      optimizedUrl: String,
    },
  },
  { timestamps: true }
);

// Geo index for matching donors
BloodRequestSchema.index({ location: "2dsphere" });

const BloodRequestModel = mongoose.model("BloodRequest", BloodRequestSchema);
module.exports = BloodRequestModel;
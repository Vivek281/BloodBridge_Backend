const Joi = require("joi");
const { BloodGroup, Urgency, RequestStatus } = require("../config/constants");

// Nepal Mobile Number Regex (same as User DTO)
const mobileNo = /^(?:\+977[\s-]?|977[\s-]?)?(98|97|96|91)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{3}$/;

const CreateBloodRequestDTO = Joi.object({
    patientBloodGroup: Joi.string().valid(...Object.values(BloodGroup)).required(),
    urgency: Joi.string().valid(...Object.values(Urgency)).default(Urgency.MEDIUM),
    hospitalName: Joi.string().min(3).max(100).required(),
    phone: Joi.string().regex(mobileNo).required()
        .messages({
            "string.pattern.base": "Please provide a valid Nepali contact number for the hospital/patient."
        }),
    // Location coordinates for the hospital
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    healthReport: Joi.string().allow(null,"",).optional().default(null),
});

const UpdateBloodRequestStatusDTO = Joi.object({
    status: Joi.string()
        .valid(...Object.values(RequestStatus))
        .required(),
    
    // If a donation is accepted, you might need to pass the ID
    acceptedDonationId: Joi.string().hex().length(24).optional()
});

module.exports = {
    CreateBloodRequestDTO,
    UpdateBloodRequestStatusDTO
};
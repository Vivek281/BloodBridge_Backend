const Joi = require("joi");
const { BloodGroup, Roles, Gender } = require("../config/constants");

// Password: 1 small, 1 capital, 1 number, 1 special char, 8-25 chars
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W@_-]).{8,25}$/;

// Nepal Mobile Number Regex
const mobileNo = /^(?:\+977[\s-]?|977[\s-]?)?(98|97|96|91)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{3}$/;

const LoginDTO = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const RegisterDTO = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        "string.min": "Name should be of atleast 2 characters"
    }),
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().regex(passwordRegex).required().messages({
        "string.pattern.base": "Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 special character (8-25 characters)."
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Passwords do not match."
    }),
    phone: Joi.string().regex(mobileNo).required().messages({
        "string.pattern.base": "Should only support Nepal's mobile numbers."
    }),
    bloodGroup: Joi.string().valid(...Object.values(BloodGroup)).required(),
    gender: Joi.string().valid(...Object.values(Gender)).required(),
    role: Joi.string().valid(...Object.values(Roles)).default(Roles.USER),
    address: Joi.string().allow(null,"",).optional().default(null),
    
    // GeoJSON Data - Flat structure for the incoming request
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    
    // Optional/Internal fields
    fcmToken: Joi.string().allow(null, "").optional(),
});

module.exports = {
    LoginDTO,
    RegisterDTO
};
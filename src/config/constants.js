const BloodGroup = {
    "A_POSITIVE":"A+",  
    "A_NEGATIVE": "A-",
    "B_POSITIVE": "B+",
    "B_NEGATIVE": "B-",
    "AB_POSITIVE": "AB+",
    "AB_NEGATIVE":"AB-",
    "O_POSITIVE":"O+",
    "O_NEGATIVE":"O-"
}
const Roles = {
    ADMIN:"admin",
    USER:"user"
}
const Gender = {
    MALE:"male",
    FEMALE:"female",
    OTHERS:"others"
}
const Status = {
    ACTIVE : "active",
    INACTIVE : "inactive"
}
const Urgency = {
    LOW:"low",
    MEDIUM:"medium",
    HIGH:"high",
    EMERGENCY:"emergency"
}
const RequestStatus = {
    PENDING:"pending",
    ACCEPTED:"accepted",
    FULFILLED:"fulfilled",
    CANCELLED:"cancelled"
}
const DonationStatus = {
    ACCEPTED:"accepted",
    COMPLETED:"completed",
    FAILED:"failed",
    CANCELLED:"cancelled"
}
module.exports = {
    BloodGroup,
    Roles,
    Gender,
    Status,
    Urgency,
    RequestStatus,
    DonationStatus
}
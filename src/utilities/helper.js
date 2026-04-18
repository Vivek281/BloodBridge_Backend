const UserModel = require("../models/User.model");
const randomStringGenerator = (length = 100) => {
    const chars = "0987654321abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const len = chars.length;

    let random = "";
    for (let i = 0; i < length; i++) {
        // Picking random characters
        const posn = Math.ceil(Math.random() * (len - 1))
        random += chars[posn];
    }
    return random;
}

const pruneDeadTokens = async (response, deviceTokens) => {
    // Identify tokens that failed with "NotRegistered" or "Invalid"
    const tokensToRemove = [];

    response.responses.forEach((res, index) => {
        if (!res.success) {
            const errorCode = res.error.code;
            if (
                errorCode === 'messaging/registration-token-not-registered' ||
                errorCode === 'messaging/invalid-registration-token'
            ) {
                tokensToRemove.push(deviceTokens[index]);
            }
        }
    });

    // If we found dead tokens, pull them from the database globally
    if (tokensToRemove.length > 0) {
        await UserModel.updateMany(
            { fcmTokens: { $in: tokensToRemove } },
            { $pull: { fcmTokens: { $in: tokensToRemove } } }
        );
    }
}

module.exports = {
    randomStringGenerator,
    pruneDeadTokens
}
const randomStringGenerator = (length = 100) =>{
    const chars = "0987654321abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const len = chars.length;

    let random = "";
    for(let i = 0; i<length; i++){
        // Picking random characters
        const posn = Math.ceil(Math.random() * (len - 1))
        random += chars[posn];
    }
    return random;
}

module.exports = {
    randomStringGenerator
}
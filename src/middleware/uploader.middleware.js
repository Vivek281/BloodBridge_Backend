const multer = require("multer");
const fs = require("fs");

const uploader = (type = "image") =>{
    const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const path = "./public/uploads"
            if(!fs.existsSync(path)){
                fs.mkdirSync(path, {recursive: true});
            }
            cb(null, path);

        },
        filename: (req, file, cb) => {
            const filename = Date.now() + "-" + file.originalname;
            cb(null, filename);
        }
    })

    let allowedExt = ["jpg", "jpeg", "png", "gif", "webp","bmp","tiff","ico","svg"];
    if(type === "doc"){
        allowedExt = ["pdf", "doc", "docx", "xls", "xlsx", "json"];
    }
 const fileFilter = (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    if(allowedExt.includes(fileExt.toLowerCase())){
        cb(null, true);
    }else{
        cb({code: 400, details: {[file.fieldname]: "File format not supported"}, message: "File upload error", status: "FILE_FORMAT_NOT_SUPPORTED_ERR"})
    }
 }

    return multer({
        storage: diskStorage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 1024 * 1024 * 5, // 5MB
        }
    })

}
module.exports = uploader;
const cloudinary = require("cloudinary").v2;
const { CloudinaryConfig } = require("../config/app.config");
const fs = require("fs")

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: CloudinaryConfig.cloudName,
      api_key: CloudinaryConfig.apiKey,
      api_secret: CloudinaryConfig.apiSecret
    })
  }

  async uploadSingleFile(filepath, dir='/') {
    try{
      const {public_id, secure_url} = await cloudinary.uploader.upload(filepath, {
        folder: "/bloodbridge"+dir,
        unique_filename: true
      })

      // delete temp file 
      if(fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      const optimizedUrl = cloudinary.url(public_id, {
        transformation: [
          { fetch_format: "auto", quality: "auto" }
        ],
      });

      return {
        publicId: public_id,
        secureUrl: secure_url,
        optimizedUrl: optimizedUrl,
      };


    } catch(exception) {
      // console.error(exception)
      throw {code: 500, message: "File upload failed in cloudinary", status: "CLOUDINARY_FILE_UPLOAD_ERR"}
    }
  }
}

module.exports = new CloudinaryService()
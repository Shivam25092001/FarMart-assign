import admin from "firebase-admin";
import File from "../models/file.model.js";
import crypto from "crypto";
import Credentials from "../farmart-assign-firebase-adminsdk-s0o0v-8c40d35328.json" assert { type: "json" };


admin.initializeApp({
    credential: admin.credential.cert(Credentials), 
    storageBucket: "farmart-assign.appspot.com"
})


const getFilePublicUrl = async (bucket, fileName)=>{
    try {
      const [url] = await bucket.file(fileName).getSignedUrl({
        action: 'read',
        expires: '03-01-2026' // Adjust the expiry date as desired
      });
      return url;
    } catch (error) {
      console.error(error);
      throw error;
    }
};


const upload_file = async(req, res) => {
    try{
        const file = req.file;
        if(!file){
            return res.status(400).json({
                success: false,
                error: "No file uploaded"
            });
        }

        const new_file_name = Date.now() + "-" + file.originalname;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // Set the expiration date to 7 days from now

        const bucket = admin.storage().bucket();
        const fileUpload = bucket.file(new_file_name);
        const blobStream = fileUpload.createWriteStream({
            metadata:{
                contentType: file.mimetype,
                expires: expirationDate.toISOString()
            }
        });

        blobStream.on("error", (error) => {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: 'Server error'
            });
        });

        blobStream.on("finish", async () => {
            // Get the public URL for the uploaded file
            const publicUrl = await getFilePublicUrl(bucket, fileUpload.name);
        
            //Generate short link
            const shortUrl = crypto.createHash('md5').update(publicUrl).digest('hex');

            //Save file metadata to mongoDB
            const newFile = new File({
                shortUrl,
                originalname: file.originalname,
                filename: fileUpload.name,
                fileSize: file.size,
                fileType: file.mimetype,
                fileUrl: publicUrl,
            });

            await newFile.save();
            
            res.json({
                success: true,
                newFile,
            });
        });

        blobStream.end(file.buffer);
    }
    catch (error){
        console.log("Error in file upload" + error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


const get_file = async(req, res) => {
    try{
        const file = await File.findOne({shortUrl: req.params.shortUrl});
        if(!file){
            return res.status(404).json({
                success: false,
                error: "File not found"
            });
        }

        return res.status(200).json({
            success: true,
            filename: file.originalname,
            publicUrl: file.fileUrl
        });
    }
    catch(error){
        console.log("Error in get file" + error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


export {upload_file, get_file};
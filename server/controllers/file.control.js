import admin from "firebase-admin";
import File from "../models/file.model.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import Credentials from "../farmart-assign-firebase-adminsdk-s0o0v-8c40d35328.json" assert { type: "json" };


// admin.initializeApp({
//     credential: admin.credential.cert({
//         "type": "service_account",
//         "project_id": process.env.FIREBASE_PROJECT_ID,
//         "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
//         "private_key": process.env.FIREBASE_PRIVATE_KEY,
//         "client_email": process.env.FIREBASE_CLIENT_EMAIL,
//         "client_id": process.env.FIREBASE_CLIENT_ID,
//         "auth_uri": process.env.FIREBASE_AUTH_URI,
//         "token_uri": process.env.FIREBASE_TOKEN_URI,
//         "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//         "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
//         "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
//       }),
//     storageBucket: "farmart-assign.appspot.com"
// })
admin.initializeApp({
    credential: admin.credential.cert(Credentials), 
    storageBucket: "farmart-assign.appspot.com"
})


const getFilePublicUrl = async (bucket, fileName)=>{
    try {
      const [url] = await bucket.file(fileName).getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Adjust the expiry date as desired
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
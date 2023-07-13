import admin from "../firebase-connect.js";
import File from "../models/file.model.js";
import crypto from "crypto";
import asyncCatch from "../middlewares/catchAsync.js";
import ErrorHandler from "../utils/errorHandler.js";

const getFilePublicUrl = async (bucket, fileName) => {
  try {
    const [url] = await bucket.file(fileName).getSignedUrl({
      action: "read",
      expires: "03-01-2026", // Adjust the expiry date as desired
    });
    return url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const upload_file = asyncCatch(async (req, res, next) => {

  const file = req.file;
  const owner_id = req.user ? req.user.id : null;
  if (!file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  const new_file_name = Date.now() + "-" + file.originalname;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Set the expiration date to 7 days from now

  const bucket = admin.storage().bucket();
  const fileUpload = bucket.file(new_file_name);
  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
      expires: expirationDate.toISOString(),
    },
  });

  blobStream.on("error", (error) => {
    console.log(error);
    return next(new ErrorHandler("Cloud Server error", 400));
  });

  blobStream.on("finish", async () => {
    // Get the public URL for the uploaded file
    const publicUrl = await getFilePublicUrl(bucket, fileUpload.name);

    //Generate short link
    const shortUrl = crypto.createHash("md5").update(publicUrl).digest("hex");

    //Save file metadata to mongoDB
    const newFile = new File({
      shortUrl,
      originalname: file.originalname,
      filename: fileUpload.name,
      fileSize: file.size,
      fileType: file.mimetype,
      fileUrl: publicUrl,
      owner_id : owner_id
    });

    await newFile.save();

    res.json({
      success: true,
      newFile,
    });
  });

  blobStream.end(file.buffer);
});


//get file from shortUrl
const get_file = asyncCatch( async (req, res, next) => {

    const file = await File.findOne({ shortUrl: req.params.shortUrl });
    if (!file) {
        return next(new ErrorHandler("File not found!", 404));
    }

    return res.status(200).json({
      success: true,
      filename: file.originalname,
      publicUrl: file.fileUrl,
    });

});


//get all files of a user
const all_files = asyncCatch( async(req, res, next) => {

  const files = await File.find({ 'owner_id': req.user.id });

  res.status(200).json({
      success: true,
      files
  })
});


//delete a file
const delete_file = asyncCatch(async (req, res, next)=>{
  let file  = await File.findOne({ shortUrl: req.params.id });

  if(!file){
    return next(new ErrorHandler("File not found!", 404));
  }

  if(!file.owner_id){
    return next(new ErrorHandler("You are not authorized to delete this file", 404));
  }

  if(file.owner_id.toString() !== req.user.id.toString()){
    return next(new ErrorHandler("You are not authorized to delete this file", 401));
  }

  // Remove file from Firestore
  const storage = firebaseAdmin.storage();
  await storage.bucket().file(file.firebaseStoragePath).delete();

  // Delete file entry from mongoDB
  await File.deleteOne({ shortUrl: req.params.id });

  res.status(200).json({
    success : true,
    message : "File deleted successfully"
  })
});


export { upload_file, get_file, all_files, delete_file };

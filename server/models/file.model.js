import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    originalname: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    owner_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
});

export default mongoose.model("File", fileSchema);

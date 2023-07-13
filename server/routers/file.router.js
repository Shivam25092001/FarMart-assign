import express from "express";
import fileUploadMiddleware from "../middlewares/multer.config.js";
import isUserAuthentic from "../middlewares/auth.js";
import { upload_file, get_file, all_files, delete_file } from "../controllers/file.control.js";


const router = express.Router();

router.post("/upload", isUserAuthentic, fileUploadMiddleware, upload_file);
router.get("/files/all", isUserAuthentic, all_files);
router.get("/file/:shortUrl", get_file );
router.delete("/file/:id", isUserAuthentic, delete_file);

export default router;


import express from "express";
import fileUploadMiddleware from "../middlewares/multer.config.js";
import { upload_file, get_file } from "../controllers/file.control.js";


const router = express.Router();

router.get("/home", (req, res) => {res.send("Hello World");} );
router.post("/upload", fileUploadMiddleware, upload_file);
router.get("/file/:shortUrl", get_file );

export default router;


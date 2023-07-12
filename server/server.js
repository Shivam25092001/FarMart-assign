import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import fileRouter from "./routers/file.router.js";

const app = express();
app.use(cors({
    " Access-Control-Allow-Origin": "*" ,
    "Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*"
}));
// app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", fileRouter);


export default app;
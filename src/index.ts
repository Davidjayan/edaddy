import mongoose from "mongoose";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { GridFsStorage } from "multer-gridfs-storage";
import multer, { memoryStorage } from "multer";
import cookieParser from "cookie-parser";
import fileRoutes from "./routes/fileRoutes";
import fileUpload from "express-fileupload";
import crypto from "crypto-js";
import fs from "fs";
import Grid from "gridfs-stream";
import bodyParser from "body-parser";
import { FileEncryptionData } from "./models/FileEncryptionData";
import FileData from "./models/FileData";

config();
let bucket: mongoose.mongo.GridFSBucket, gfs: Grid.Grid;
mongoose.connect(process.env.CONNECTION_STRING || "");

const storage = memoryStorage();

mongoose.connection.on("connected", () => {
  const db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: FileData.collection.name,
  });
});

const app = express();
const upload = multer({ storage });
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  express.urlencoded({
    extended: false,
  })
);

const conn = mongoose.connection;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection(FileData.collection.name);
});

app.use(express.json());
app.use("/", upload.single("file"), fileRoutes);
app.use(express.static(`public`));

app.listen(process.env.PORT, function () {
  console.log(`Application live on localhost:${process.env.PORT}`);
});

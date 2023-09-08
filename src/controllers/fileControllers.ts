import { NextFunction, Request, Response } from "express";
import { FileEncryptionData } from "../models/FileEncryptionData";
import { Utils } from "../utils/utils";
import FileDataModel from "../models/FileData";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const saveData = async (req: Request, res: Response, next: NextFunction) => {
  const { name, input_type, file_type } = req.body;
  const file = req.file as any;

  if (
    !name ||
    !input_type ||
    (input_type === "file" && (!file_type || file == undefined))
  ) {
    res.status(400).json({ error: "Required datas are missing" });
  } else {
    try {
      let fileData = null;
      if (input_type === "file") {
        if (file.size > 16 * 1000 * 1000) {
          return res.status(400).json({
            message: "File is too big.Please upload file lesser than 16mb",
          });
        }
        const { encryptedData, key } = Utils.encryptFile(
          file.buffer.toString("base64")
        );
        fileData = new FileDataModel({
          ...req.body,
          file: encryptedData,
        });

        fileData.save();
        new FileEncryptionData({
          refId: fileData._id,
          secret_key: key,
          filename: file.originalname,
          type: file.mimetype,
        }).save();
      } else {
        fileData = new FileDataModel({
          ...req.body,
        });
        fileData.save();
      }

      if (fileData !== null) {
        return res
          .status(201)
          .json({ message: "Data saved successfully", fileData });
      } else {
        return res.status(500).json({ message: "Internal server error" });
      }

      // const id = new mongoose.Types.ObjectId();
      // const writestream = bucket.openUploadStreamWithId(
      //   id,
      //   file.originalname,
      //   {
      //     contentType: file.mimetype,
      //   }
      // );
      // writestream.write(encryptedData);
      // writestream.end();

      // writestream.on("close", () => {
      //   return res
      //     .status(201)
      //     .json({ message: "File uploaded successfully" });
      // });

      // writestream.on("error", (err: any) => {
      //   console.error(err);
      //   return res.status(500).json({ message: "Error uploading file" });
      // });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const getFile = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const _id = new mongoose.Types.ObjectId(id);
    const fileData = await FileDataModel.findById(_id);
    if (fileData == null) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    const meta = await FileEncryptionData.findOne({ refId: _id });
    const decryptedData = Utils.decryptFile(
      fileData?.file || "",
      meta?.secret_key || ""
    );
    const filename =
      path.join("public", _id.toString() || "") +
      path.extname(meta?.filename || "");
    fs.writeFileSync(filename, decryptedData, {
      encoding: "base64",
    });
    return res.status(200).json({
      message: "Success",
      url: path.join(process.env.URL || "", filename),
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({ message: error?.message });
  }
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  const { skip, limit, sort, search_key, tags } = req.query;
  if (!skip || !limit || !sort) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const search_key_criteria = search_key ? { name: { $eq: search_key } } : {};

    const tag_search_criteria = tags
      ? { tags: { $in: JSON.parse(tags.toString()) } }
      : {};
    const data = await FileDataModel.aggregate([
      {
        $project: {
          file: 0,
        },
      },
      {
        $match: { ...search_key_criteria, ...tag_search_criteria },
      },
      {
        $skip: parseInt(skip.toString()),
      },
      {
        $sort: { date: parseInt(sort.toString()) == 1 ? 1 : -1 },
      },
      {
        $limit: parseInt(limit.toString()),
      },
    ]).exec();
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export default { saveData, getFile, list };

import mongoose from "mongoose";

const fileEncryptionSchema = new mongoose.Schema(
  {
    refId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    secret_key: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const FileEncryptionData = mongoose.model(
  "FileEncryptionData",
  fileEncryptionSchema
);

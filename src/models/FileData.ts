import mongoose, { Document } from "mongoose";

interface FileDataSchemaModel extends Document {
  name: string;
  input_type: string;
  file_type?: string;
  tags?: Array<string>;
  file?: string;
  date?: Date;
}

const fileDataSchema = new mongoose.Schema<FileDataSchemaModel>({
  name: { type: String, required: true },
  input_type: {
    type: String,
    enum: ["text", "number", "file"],
    default: "text",
  },
  file_type: {
    type: String,
    required: function (this: FileDataSchemaModel) {
      return this.input_type === "file";
    },
  },
  tags: {
    type: [String],
    required: false,
  },
  file: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const FileDataModel = mongoose.model<FileDataSchemaModel>(
  "FileData",
  fileDataSchema
);

export default FileDataModel;

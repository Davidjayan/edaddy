import express from "express";
import fileController from "../controllers/fileControllers";
const router = express.Router();
router.route('/').get((req,res)=>res.status(200).send('Ok'))
router.route("/save-data").post(fileController.saveData);
router.route('/get-file/:id').get(fileController.getFile);
router.route('/list').get(fileController.list);
export default router;

import express from 'express';
import { uploadPdf } from "../controllers/uploadPdf";
import upload from "../middlewares/uploadPdf"

const router = express.Router();

router.post('/', upload.single("file"), uploadPdf);

module.exports = router;

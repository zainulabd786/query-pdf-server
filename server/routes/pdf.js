import express from 'express';
import { uploadPdf, qyeryPdf } from "../controllers/pdf";
import upload from "../middlewares/uploadPdf"

const router = express.Router();

router.post('/upload', upload.single("file"), uploadPdf);
router.post('/query', qyeryPdf);

module.exports = router;

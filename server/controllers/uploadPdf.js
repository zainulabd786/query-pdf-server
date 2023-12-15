import { splitIntoChunks } from "../utils";
import pdfParse from 'pdf-parse';
import fs from 'fs';
import util from 'util';
const readFile = util.promisify(fs.readFile);

export async function uploadPdf (req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded or invalid file format.');
    }

    try {
        // Read the file from the disk
        const filePath = req.file.path;
        const fileBuffer = await readFile(filePath);

        // Parse the PDF
        const data = await pdfParse(fileBuffer);
        const text = data.text;

        // Split the text into chunks
        const chunks = splitIntoChunks(text, 1000);

        res.json({ chunks });

        // delete the file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file ${filePath}:`, err);
        });
    } catch (error) {
        res.status(500).send(error.toString());
    }
}
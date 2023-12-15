import { splitIntoChunks } from "../utils";

export async function uploadPdf (req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded or invalid file format.');
    }

    try {
        const dataBuffer = req.file.buffer;
        const data = await pdfParse(dataBuffer);
        const text = data.text;

        // Split the text into chunks
        const chunks = splitIntoChunks(text, 1000);

        res.json({ chunks });
    } catch (error) {
        res.status(500).send(error.toString());
    }
}
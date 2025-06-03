// server/src/controllers/texts.controller.js
import { handleUploadText } from '../services/text.service';

exports.uploadText = async (req, res) => {
    try {
        console.log("passing req", req.body);
        const { writerName, title } = req.body
        const file = req.file

        if (!writerName || !title || !file) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const result = await handleUploadText({
            writerName,
            title,
            fileBuffer: file.buffer,
            fileName: file.originalname
        })

        res.status(201).json({ message: 'Upload successful', data: Number(result.insertId) });
        res.send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        res.send();
    }
};


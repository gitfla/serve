// server/src/controllers/texts.controller.js
import { deleteText, handleUploadText, fetchTexts, getText } from '../services/text.service';
import { enqueueTextProcessingTask} from '../services/task.service';

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

        // Enqueue background processing task
        console.log("enqueuing processing task, jobId:", result);
        await enqueueTextProcessingTask(result)

        res.status(201).json({ message: 'Upload successful', data: Number(result) });
        res.send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        res.send();
    }
};

exports.fetchTexts = async (req, res) => {
    try {
        const texts = await fetchTexts();
        res.json(texts)
    } catch (error) {
        console.error('Error fetching texts:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
};

exports.getText = async (req, res) => {
    try {
        const {textId} = req.body
        const text = await getText(textId);
        res.json(text);
    } catch (error) {
        console.error('Error fetching text:', error)
        res.status(500).json({error: 'Internal server error'})
    }
};

exports.deleteText = async (req, res) => {
    const textId = parseInt(req.params.id, 10)
    if (isNaN(textId)) {
        return res.status(400).json({ error: 'Invalid text ID' })
    }
    try {
        await deleteText(textId)
        res.status(200).json({ success: true });
        res.send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        res.send();
    }
};




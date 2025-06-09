// server/src/controllers/texts.controller.js
import { handlePreprocessWriters } from '../services/preprocess.service';

exports.preprocessWriters = async (req, res) => {
    try {
        console.log("passing req", req.body);

        const params = req.body?.params;

        if (!params || !Array.isArray(params.writerIds) || params.writerIds.length === 0) {
            return res.status(400).json({ error: 'writerIds must be a non-empty array' });
        }

        const writerIds  = params.writerIds;

        handlePreprocessWriters(writerIds).catch(console.error)

        res.status(200).json({ message: 'Preprocessing started', writerIds })
        res.send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        res.send();
    }
};


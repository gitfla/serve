// server/src/controllers/texts.controller.js
import {handleProcessJob, handleProcessWriters} from '../services/process.service';

exports.processJob = async (req, res) => {
    try {
        const { textId } = req.body
        if (!textId) {
            return res.status(400).json({ error: 'Missing jobId' })
        }

        // Run your background job logic here
        // e.g. processTextJob(jobId)
        console.log("about to call handleProcessJob: ", textId)
        handleProcessJob(textId).catch(console.error)

        res.status(200).json({ message: `Processing started for job ${textId}` })
    } catch (error) {
        console.error('Error processing job:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

exports.processWriters = async (req, res) => {
    try {
        console.log("passing req", req.body);

        const params = req.body?.params;

        if (!params || !Array.isArray(params.writerIds) || params.writerIds.length === 0) {
            return res.status(400).json({ error: 'writerIds must be a non-empty array' });
        }

        const writerIds  = params.writerIds;

        handleProcessWriters(writerIds).catch(console.error)

        res.status(200).json({ message: 'processing started', writerIds })
        res.send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        res.send();
    }
};


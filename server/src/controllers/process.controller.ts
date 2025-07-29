// server/src/controllers/texts.controller.js
import {handleProcessJob} from '../services/process.service';

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

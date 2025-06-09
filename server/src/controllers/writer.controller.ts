import { fetchWriters } from '../services/writer.service'

exports.fetchWriters = async (req, res) => {
    try {
        const writers = await fetchWriters();
        res.json(writers)
    } catch (error) {
        console.error('Error fetching writers:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
};

/*exports.deleteWriter = async (req, res) => {
    const writerId = parseInt(req.params.id, 10)
    if (isNaN(writerId)) {
        return res.status(400).json({ error: 'Invalid text ID' })
    }
    try {
        await deleteWriter(writerId);
        res.status(200).json({ success: true });
        res.send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        res.send();
    }
};*/
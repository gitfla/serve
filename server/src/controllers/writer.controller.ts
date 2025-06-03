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
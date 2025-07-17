const express = require('express');
const { fetchWriters, getProcessingWriters } = require('../controllers/writer.controller');

const writersRouter = express.Router();

writersRouter.get('/', fetchWriters);
writersRouter.get('/processing', getProcessingWriters);

module.exports = writersRouter;
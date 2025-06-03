const express = require('express');
const { fetchWriters } = require('../controllers/writer.controller');


const writersRouter = express.Router();

writersRouter.get('/', fetchWriters);

module.exports = writersRouter;
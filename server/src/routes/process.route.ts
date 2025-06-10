const express = require('express');

const { processJob } = require('../controllers/process.controller');

const processRouter = express.Router();

processRouter.post('/',  processJob);

module.exports = processRouter;
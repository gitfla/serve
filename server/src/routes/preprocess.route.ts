const express = require('express');

const { preprocessWriters } = require('../controllers/preprocess.controller');

const preprocessRouter = express.Router();

preprocessRouter.post('/',  preprocessWriters);

module.exports = preprocessRouter;
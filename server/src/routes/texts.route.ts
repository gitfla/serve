const express = require('express');
const upload = require('../middlewares/multer')
const { uploadText } = require('../controllers/text.controller');

const textsRouter = express.Router();

textsRouter.post('/', upload.single('file'), uploadText);

module.exports = textsRouter;
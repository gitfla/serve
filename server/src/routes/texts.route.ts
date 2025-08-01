import { Router } from 'express';
const upload = require('../middlewares/multer')
const { uploadText, fetchTexts, deleteText } = require('../controllers/text.controller');

const textsRouter = Router();

textsRouter.post('/', upload.single('file'), uploadText);
textsRouter.get('/', fetchTexts);
textsRouter.delete('/:id', deleteText);

module.exports = textsRouter;
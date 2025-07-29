import { Router } from 'express';

const { processJob } = require('../controllers/process.controller');

const processRouter = Router();

processRouter.post('/',  processJob);

module.exports = processRouter;
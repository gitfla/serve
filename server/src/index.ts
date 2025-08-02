const express = require('express');
const cors = require('cors');
const textsRouter = require('./routes/texts.route');
const writersRouter = require('./routes/writers.route');
const processRouter = require('./routes/process.route');
const conversationRouter = require('./routes/conversation.route');
const app = express();

require('dotenv').config({ path: '../vars/.env'});

app.use(cors());
app.use(express.json());
// Mount routers
app.use('/api/texts', textsRouter);
app.use('/api/writers', writersRouter);
app.use('/api/conversation', conversationRouter);
app.use('/internal/process', processRouter);

app.get('/', (req, res) => {
    res.send('Its working ayyy')
})

app.listen(8080, () => {
    console.log('server running on port 8080');
})

app.get('/debug/env', (req, res) => {
    const envSubset = Object.keys(process.env)
        .filter(key => key.includes('GCS') || key.includes('TASK') || key.includes('DB') || key.includes('COHERE'))
        .reduce((obj, key) => {
            obj[key] = process.env[key];
            return obj;
        }, {} as Record<string, string | undefined>);

    res.json(envSubset);
});
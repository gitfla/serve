const express = require('express');
const cors = require('cors');
const textsRouter = require('./routes/texts.route');
const writersRouter = require('./routes/writers.route');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());
// Mount routers
app.use('/api/texts', textsRouter);
app.use('/api/writers', writersRouter);

app.get('/', (req, res) => {
    res.send('Its working ayyy')
})

app.listen(8080, () => {
    console.log('server running on port 8080');
})

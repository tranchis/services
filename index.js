const express = require('express')
const app = express()
const port = 4224
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());

// Parsing & Initialization
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.get('/is-alive', (req, res) => res.sendStatus(200));


app.get('/airport', (req, res) => {
    let tmp = req.query;
    console.log(tmp);
    res.send('tmp');
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
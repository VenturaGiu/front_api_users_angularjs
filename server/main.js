const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
app.use(cors());

console.log(`${__dirname}/..`)

console.log(new Date())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(`${__dirname}/../`));
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', path.join(__dirname, '../'));

app.route('/').get((req, res) => { res.render('index.ejs'); });


app.listen(3000)
console.log('listening in 3000')
const express = require('express')
const app = express()
const PORT = (process.env.PORT || 3000);

const ROOT_DIR = `/public`;

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/html'));

console.log(__dirname + '/html');

app.get('/', (req, res) => res.sendFile(`${__dirname}/html/index.html`))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
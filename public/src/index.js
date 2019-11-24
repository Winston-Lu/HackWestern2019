const express = require('express')
const app = express()
const PORT = (process.env.PORT || 3000);
const googleService = require('./google.service')

const runVoice = (res) => {
  res.sendFile(`${__dirname}/html/index.html`)
  googleService.startAPI();
}

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/html'));

app.get('/game', (req, res) => runVoice(res))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
const fs = require('fs');
const path = require('path');
const express = require('express');
const https = require('httpolyglot');
const { Server } = require('socket.io');

const app = express();

const socket = require('./socket');
const config = require('./config');

const httpsServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, config.sslKey), 'utf-8'),
  cert: fs.readFileSync(path.join(__dirname, config.sslCrt), 'utf-8')
}, app);

app.use(express.static(path.join(__dirname, 'client')));

httpsServer.listen(config.listenPort, () => {
  console.log(`Listening on https://${config.listenIp}:${config.listenPort}`);
});

socket(new Server(httpsServer));

process.on('uncaughtException', err => {
  console.error(`Caught exception: ${err}`);
});
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const urlencodedBodyParser = bodyParser.urlencoded({ extended: false });
const io = require('socket.io');
const app = express();
const httpServer = http.createServer(app);
const realtimeServer = io(httpServer);

module.exports = function (app) {
  const db = app.get('db');
  const traffic = db.collection("traffic");

  // Render the index page on request
  app.get('/', async (req, res) => {
    let newTraffic = {
      visitTime: new Date()
    }
    // Notify DB the user has visited this page

    if (req.session.username) {
      newTraffic.username = req.session.username
    } else {
      newTraffic.username = 'Guest'
    }

    await traffic.insert(newTraffic);

    // Send along Session Data
    res.render('index', { session: req.session });
  });
};

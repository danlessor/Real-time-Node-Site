# Minimal Site Code ReadMe
---

## Introduction
This app is made to be used as a template from which real time applications can
be created. Users who wish to begin development on their node.js app immediately
without a need to perform basic site setup will find this tool useful.

## Required Dependencies
- [MongoDB 3.4.10](https://www.mongodb.com/download-center#community)
- [NodeJS](https://nodejs.org/en/download/)

## Install
1. Place Files in desired location on PC
2. Run mongod.exe which can be found at the MongoDB install location
3. Open CMD, and CD to Minimal Site project folder
4. Run: ```npm install```
5. Turn the server on by running: ```node server.js```
6. Navigate to [localhost:8080](http://localhost:8080/) in your web browser.
7. You should now be able to use the system.

## Workflow

### server.js
The server.js script will handle all HTTP requests for this application. When
the user navigates to localhost:8080, this script will be the one receiving that
HTTP request.

The server.js script is the file to update when handling routes,
POST/GET content, or database interactions. The script is also responsible for
receiving event emissions from the client.js script and responding with its own
event emissions and data.

### Example process

1. User navigates to http://localhost:8080/.
2.
// Render the index page on request
app.get('/', (req, res) => {
  // Send along Session Data
  res.render('index', { session: req.session });
})
3. App.Get function in Server.js will see that the user navigated to / and will
use res.render('page') to send the user to the appropriate page found within the
Views folder. In this case the page is index.ejs.

4. Index.ejs will display the data. Server.js may still listen in real time for
an emit, and query the database, and then send an emit with the data so that
client.js may collect the data, and update index.ejs in real time.

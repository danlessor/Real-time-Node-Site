// NPM Libraries to use
// Node's built-in HTTP module for web service, handles request/response/etc.
// @see https://nodejs.org/api/http.html
const http = require('http');
// 3rd party module for web service framework, simplifies many things.
// @see https://www.npmjs.com/package/express
const express = require('express');
// 3rd party addon module for the express framework, adds sessions.
// @see https://www.npmjs.com/package/express-session
const session = require('express-session');
// 3rd party module for realtime framework.
// @see https://www.npmjs.com/package/socket.io
const io = require('socket.io');
// 3rd party module for MongoDB driver, facilitates interfacing with MongoDBs.
// @see https://www.npmjs.com/package/mongodb
const mongodb = require('mongodb');
// 3rd party module for parsing form submissions to objects. Form submissions
// are usually URL-encoded or in multipart format, both of which are non-JSON
// strings. Something must convert them to object and this module does it.
// @see https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');
const app = express();
const urlencodedBodyParser = bodyParser.urlencoded({ extended: false });
// Create the HTTP & RealTime Server
const httpServer = http.createServer(app);
const realtimeServer = io(httpServer);
// Set the View Engine
app.set('view engine', 'ejs');
// Connect to Database
var url = "mongodb://localhost:27017/msc";
mongodb.connect(url, function(err, client) {
  if (err) throw err;
  console.log("Database connection success");
  // MongoDB includes a ObjectID property
  const ObjectId = mongodb.ObjectId;
  // Specify the Database name for MongoDB
  const db = client.db('msc');
  // Specify the collection inside the database we will be working with
  const users = db.collection("users");
  // Settup sessions
  app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true
  }));
  // Let Express know where to find the public folder
  app.use('/public', express.static('public'));


  // ROUTE HANDLERS BELOW THIS LINE -----------------------------------------------------------------------------
  // Render the index page on request
  app.get('/', (req, res) => {
    // Send along Session Data
    res.render('index', { session: req.session });
  })

  //Handle user Sign-Out
  app.get('/sign-out', (req, res) => {
    // Destroy Session Data
    req.session.destroy()
    res.redirect('back')
  })

  // Render the register page on request
  app.get('/register', (req, res) => {
    // Send along Session Data
    res.render('register', { session: req.session });
  })

  // Render the admin page on request
  app.get('/admin', (req, res) => {
    // Send along Session Data
    res.render('admin', { session: req.session });
  })


// FORM POST DATA BELOW THIS LINE -----------------------------------------------------------------------------
  // When the Register form is posted, this function will run
  app.post('/register', urlencodedBodyParser, async(req, res) =>{
    // Get the POST content from the form
    let user = req.body.username;
    let pass1 = req.body.pass1;
    let pass2 = req.body.pass2;

    // Ensure no fields are empty
    if (!user || !pass1 || !pass2) {
      console.log('A field was left empty');
    }else{
      // Ensure passwords match
      if(pass1 === pass2){
        // Check if user already exists
        const user_exists_check = await users.findOne({username: user});
        if(user_exists_check === null){
          // User does not already exist, insert into database
          const result = await users.insert({username: user, password: pass1});
          // Assign the user a session because signing in after registering is evil
          req.session.username = user;
          //Update Users List
          const usersList = await users.find().toArray();
          realtimeServer.emit('users-list', usersList);
          //Send the user back to the page they were on
          res.redirect('/')
        }else{
          //User already exists
          console.log('User already exists');
        }
      }else{
        console.log("Passwords do not match");
      }
    }
  })

  app.post('/log-in', urlencodedBodyParser, async(req, res) =>{
    let user = req.body.username;
    let pass = req.body.password;
    // Ensure no fields are empty
    if(!user || !pass){
      console.log('A field was left empty');
    }else{
      //Check for user in db
      const user_exists_check = await users.findOne({username: user, password: pass});
      //If user exists, assign them a session
      if(user_exists_check){
        req.session.username = user;
        res.redirect('/')
      }else{
        console.log('No user found with those credentials');
      }
    }
  });
  // REAL TIME SERVER EMITS AND LISTENERS HERE -------------------------------------------------------------
  realtimeServer.on('connect', function (socket) {
    // A client has connected to the realtime server.
    socket.on('want-users-list', async function () {
      // This client is asking for users list data. Ok.
      const usersList = await users.find().toArray();
      socket.emit('users-list', usersList);
    });
  });





  //Start the server
  httpServer.listen(8080, function () {
      console.log('Listening on port 8080.')
  });
});

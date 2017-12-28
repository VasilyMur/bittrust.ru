const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle an bad connections
mongoose.connect('mongodb://2011mckinsey:crazyv@ds133077.mlab.com:33077/bit-trust');
//mongoose.connect('mongodb://2011mckinsey:crazyv@ds127506.mlab.com:27506/my-app', { useMongoClient: true })
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

//Import all of our Models
require('./models/Company');


// Start our app!
const app = require('./app');
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

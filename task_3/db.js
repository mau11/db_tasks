var pg = require('pg');
var cred = require('./credentials.js');

var config = {
  user: cred.user,
  database: 'movies',
  password: cred.password,
  host: 'localhost',
  port: 5432
};

var client = new pg.Client(config);

// Connect to db
client.connect(function(err) {
  if(err) {
    console.log('ERROR CONNECTING TO DATABASE: ', err);
    return;
  }
  console.log('CONNECTION TO DATABASE SUCCESSFUL');
});

module.exports = {
  pg: pg,
  client: client
};

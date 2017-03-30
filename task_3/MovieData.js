var db = require('./db.js');
var cred = require('./credentials.js');
var http = require('https');

var quotes = function(input) {
  return input.replace(/'/g, "''");
};

// Get all movies currently playing in Greece.
var getAllMovies = function(req, res) {
  // Create films table if it does not already exist.
  var newFilms = "CREATE TABLE IF NOT EXISTS films (id SERIAL PRIMARY KEY NOT NULL, title varchar(35) UNIQUE,  description varchar(1000), original varchar(35), movieID varchar(35))";
  db.client.query(newFilms, function(err, rows) {
    if(err){
      console.log('ERROR WITH FILMS TABLE: ', err);
    }
  });

  // Create directors' table if it does not already exist.
  var newInfo = "CREATE TABLE IF NOT EXISTS directors (  id SERIAL PRIMARY KEY NOT NULL, names varchar(35), movieID varchar(35), imdb varchar(50))";
  db.client.query(newInfo, function(err, rows) {
    if(err){
      console.log('ERROR WITH DIRECTORS TABLE: ', err);
    }
  });

  // Get data from MovieDB
  var options = {
    "method": "GET",
    "hostname": "api.themoviedb.org",
    "port": null,
    "path": "/3/movie/now_playing?api_key=" + cred.apikey + '&language=en-GR&page=1',
    "headers": {}
  };
  var req = http.request(options, function(res) {
    var allFilms = [];
    res.on('data', function(film) {
      allFilms.push(film);
    });
    res.on('end', function() {
      var body = Buffer.concat(allFilms);
      var listing = JSON.parse(body.toString()).results;
      //console.log(listing);
      for(var i = 0; i < listing.length; i++) {
        var movie = quotes(listing[i].title);
        var des = quotes(listing[i].overview);
        var origin = quotes(listing[i].original_title);

        // Add retrieved data to database
        var addMovies = "INSERT INTO films (title, description, original) VALUES ('"+movie+"'"+","+"'"+des+"'"+","+"'"+origin+"') ON CONFLICT (title) DO NOTHING";
        db.client.query(addMovies, function(err, rows){
          if(err){
            console.log('ERROR WITH DB --->', err);
          }
        });
      }
    });
  });
  req.write("{}");
  req.end();
};

getAllMovies();


// Get directors and imdb info
var getMoreInfo = function(req, res) {

  // Get more data from MovieDB
  var options = {
    "method": "GET",
    "hostname": "api.themoviedb.org",
    "port": null,
    "path": "/3/movie/%7Bmovie_id%7D/credits?api_key=" + cred.apikey,
    "headers": {}
  };
  var req = http.request(options, function(res) {
    var allCredits = [];
    res.on('data', function(people) {
      allCredits.push(people);
    });
    res.on('end', function() {
      var body = Buffer.concat(allCredits);
      // console.log('BOD', body.toString());
      var item = JSON.parse(body.toString());
      // console.log('ITEM', item);
      for(var i = 0; i < item.length; i++) {
        console.log('JOB', item.job);
        // console.log('TITLE', item.title);
        if(item[i].job === 'director'){
          var dir = quotes(item[i].crew.name);
          var mov = quotes(item[i].id);
          // var imdb = quotes(item[i].imdb_id);
          var addDir = "INSERT INTO directors (names, movieID, imdb) VALUES ('"+dir+"'"+","+"'"+mov+"'"+","+"'"+imdb+"')";
        }

        // Add retrieved data to database
        db.client.query(addDir, function(err, rows){
          if(err){
            console.log('ERROR WITH DB --->', err);
          }
        });
      }
    });
  });
  req.write("{}");
  req.end();
};

getMoreInfo();

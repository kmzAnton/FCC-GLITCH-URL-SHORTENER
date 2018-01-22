var express = require('express');
var app = express();
var mongo = require('mongodb');
var dotenv = require('dotenv').config();  //<-----------SPEND HOURS TO FIGURE OUT WHY THE .env VAR-S DONT WORK!!!!!! 
var urlarr = [];


app.use(express.static('public'));
// console.log(process.env.MONGOLAB);

mongo.MongoClient.connect(process.env.MONGOLAB, function(err, db){
  if(err) console.log(err);
  
  app.get('/toshort/*', (req,res)=>{
    var urlfull = req.params[0];
    var re = /^https\:\/{2}www\.\w{2,}\.{1}\w{2,}/m;

    if(!re.test(urlfull)){
      
      res.send('URL format doesn"t coincide with the one in "Example usage"');
      
    }else{
    
      var rand = Math.floor(Math.random()*5001);
      var urlshort = 'http://'+req.headers['x-forwarded-host']+'/'+rand;
      var obj = {'original_url':urlfull.toString(), 'short_url':urlshort};

      res.json(obj);
      
      var database = db.db('fccurlshort');            // <------------ DEPENDENCIES 'MONGODB' version 3++ NEEDED TO DECLARE THE DATABASE FIRST
      database.collection('urlshort').insertOne(obj); // <------------ ONLY THEN INITIALIZE THE .collection.
      
      res.end();
    }
  });
  
  app.get('/:shortname', (req, res)=>{
    var shortname = req.params.shortname;
    
    var database = db.db('fccurlshort');
    var cursor = database.collection('urlshort').findOne({'short_url':'http://fcc-url-shortner.glitch.me/'+shortname},{original_url:1}, function(err,data){
      if(data!=null){res.redirect(data['original_url']);}
      else{res.send('No data found');}
    });
  });
});

app.get('/', function(req,res){
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(process.env.PORT);
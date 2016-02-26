var restify = require('restify');
var fs      = require('fs');
var app     = restify.createServer();
var db      = require('./bin/pgdb.js');

app.use(restify.queryParser())
app.use(restify.CORS())
app.use(restify.fullResponse())

// Routes
// app.get('/routes/within', db.selectBox);
app.get('/routes/:mall', db.selectAllPrecalculated);
app.get('/status', function (req, res, next)
{
  res.send("{status: 'ok'}");
});

app.get('/', function (req, res, next)
{
  // var data = fs.readFileSync(__dirname + '/index-cross.html');
  var data = fs.readFileSync(__dirname + '/index.html');
  res.status(200);
  res.header('Content-Type', 'text/html');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});

app.get(/\/(css|js|img|json)\/?.*/, restify.serveStatic({directory: __dirname+'/static'}));

app.listen(process.env.PORT || 3000, function () {
  console.log( "Listening on " + "localhost "+ ", port " + 3000 )
});

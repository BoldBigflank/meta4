
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , game = require('./game.js')
  , app = module.exports = express.createServer()
  , io = require('socket.io').listen(app)

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "macho macho man" }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', function (req, res) {
  if (typeof req.session.uuid === 'undefined') req.session.uuid = Math.floor(Math.random()*10000001)
  res.render(__dirname + '/views/index.jade', {title: "Meta4", uuid: req.session.uuid, game: game.getGame()});
}); 
//app.get('/', routes.index);
app.get('/game/:id', function(req, res){
  if (typeof req.session.uuid === 'undefined') req.session.uuid = Math.floor(Math.random()*10000001)
  res.render(__dirname + '/views/index.jade', {title: "Meta4", uuid: req.session.uuid, game: game.getGame(), room: req.params.id});
});

io.sockets.on('connection', function (socket) {
  console.log("Connection", socket.id)
  
  
  socket.on('join', function(uuid){
    socket.set('uuid', uuid)
    game.join(uuid, function(err, res){
      if (err) { socket.emit("alert", err) }
      else{ io.sockets.emit("game", res ) }
    })
  })

  // User leaves
  socket.on('disconnect', function(){
    // Don't destroy data when people leave.  Besides, it is buggy
    // socket.get('uuid', function(err, uuid){
    //   if(typeof uuid !== 'undefined' ) game.leave(uuid)
    // })
    // io.sockets.emit("game", { czar:game.getCzar(), players: game.getPlayers() } )
    console.log("Disconnect: ", socket.id)
  })
  
  socket.on('name', function(data){
    socket.get('uuid', function(err, uuid){
      game.setName(uuid, data, function(err, res){
        if (err) { socket.emit("alert", err) }
        else{ io.sockets.emit("game", res ) }
      })
      
    })
  })

  // Entry
  socket.on('entry', function(entry, cb){
    // add the entry
    console.log("Entry, ", entry)
    socket.get('uuid', function(err, uuid){
      game.addEntry(uuid, entry, function(err, res){
        if (err) { socket.emit("alert", err) }
        else{ io.sockets.emit("game", res ) }
      })  
    })
    
  })

  // State
  socket.on('state', function(data){
    // add the entry
    console.log("State, ", data)
    socket.get('uuid', function(err, uuid){
      game.setState(uuid, data, function(err, res){
        if (err) { socket.emit("alert", err) }
        else{ io.sockets.emit("game", res ) }
      })  
    })
  })

  // Vote
  socket.on('vote', function(data){
    console.log("Vote, ", data)
    socket.get('uuid', function(err, uuid){
      game.setVote(uuid, data, function(err, res){
        console.log("setVote complete, ", err, res)
        if (err) { socket.emit("alert", err) }
        else{ 
          io.sockets.emit("game", res ) 
        }
      })  
    })
  })
});

var port = process.env.PORT || 3000
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

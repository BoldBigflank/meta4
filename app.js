
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
  console.log(game.getGame())
  res.render(__dirname + '/views/index.jade', {title: "Cards Against Humanity", game: game.getGame()});
}); 
//app.get('/', routes.index);
app.get('/game', routes.game);

io.sockets.on('connection', function (socket) {
  console.log("Connection", socket.id)
  socket.set("nickname", socket.id)
  game.join(socket.id, function(player){
    console.log("Game joined")
    io.sockets.emit('game', { state: game.getState(), czar:game.getCzar(), players: game.getPlayers() } )
    socket.emit("player", player)
  })
  
  // User leaves
  socket.on('disconnect', function(){
    game.leave(socket.id)
    io.sockets.emit("game", { czar:game.getCzar(), players: game.getPlayers() } )
    console.log("Disconnect: ", socket)
  })
  
  // Entry
  socket.on('entry', function(data, cb){
    // add the entry
    console.log("Entry, ", data)
    game.addEntry({id:socket.id, text:data}, function(err){
      if (err) { cb(err) }
      else{
        io.sockets.emit("game", { state: game.getState(), entries:game.getEntries() } )
        cb(null)
      }
    })
  })
  
  socket.on('name', function(data){
    game.setName(socket.id, data)
    io.sockets.emit('game', { czar: game.getCzar(), players: game.getPlayers() })
  })

  // State
  socket.on('state', function(data, cb){
    // add the entry
    console.log("State, ", data)
    game.setState(socket.id, data, function(result){
      if(result) io.sockets.emit("game", { state: game.getState(), czar: game.getCzar() })
    })
      
  })

  socket.on('vote', function(data, cb){
    console.log("Vote, ", data)
    game.vote(socket.id, data, function(err){
      if (err) { cb(err) }
      else{
        io.sockets.emit("game", game.getGame() )
        cb(null)
      }
    })
  })
});

var port = process.env.PORT || 3000
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

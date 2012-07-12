  var socket = io.connect('http://localhost');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

  socket.on('entryCount', function(data){
  	console.log("received entryCount")
  	console.log(data)
  	// update the entries
  	$('#playersCount').html(data.players)
  	// update the players
  	$('#entriesCount').html(data.entries)
  })

  socket.on('game', function(data){
  	// Place the game data in the appropriate spots
  	// Black card
  	// Scores
  	// Players count
  	// Score count

  	// Hand cards
  	// Name

  })
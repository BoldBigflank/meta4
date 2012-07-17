var fs = require('fs')
  , _ = require('underscore')
  , http = require('http')

exports.espn = function(cb){
	var key = 'ch4qn8m6ufggcmp58wwjyavd' 
	var secret = '7dBCpV7J3n8W8s5cnP62UnBq' 
	// http://api.espn.com/:version/:resource/:method?apikey=:yourkey
	var url = "http://api.espn.com/v1/sports/news/headlines/top?apikey=" + key
	var options = {
        host: "api.espn.com",
        port: 80,
        path: "/v1/sports/news/headlines/top?apikey=" + key,
        method: 'GET'
	};
	var things = []
	var data = ''
	var req = http.request(options, function(res) {
		res.on('data', function(chunk){
			data += chunk
		})

		res.on('end', function(){
			var json = JSON.parse(data)
			for (x in json.headlines){
				var headline = json.headlines[x]
				for (y in headline.categories){
					var category = headline.categories[y]
					things.push(category.description)
				}
			}
			cb(null, _.unique(things))
		})
		
	})

	req.on('error', function(e) {
		console.log("Got error: " + e.message);
		cb(e.message)
	});

	req.end()

}

exports.guardian = function(cb){
	var things = []
	fs.readFile(__dirname + '/public/txt/guardian.json', 'utf8', function(err, data) {
		if(err) cb(err)
		var jsonData = JSON.parse(data)
        for (x in jsonData.response.results){
        	result = jsonData.response.results[x]
        	if(result.movie) things.push(result.movie.title)
        	if(result.tags){
        		for (y in result.tags){
        			var tag = result.tags[y]
        			if(tag.type == 'keyword')
        				things.push(tag.webTitle)
        		}
        	}
        }
        cb(null, _.unique(things))
    });
}

exports.rovi = function(cb){
	var things = []
	fs.readFile(__dirname + '/public/txt/rovimovies.json', 'utf8', function(err, data) {
		if(err) cb(err)
		var jsonData = JSON.parse(data)
        for (x in jsonData.searchResponse.results){
        	result = jsonData.searchResponse.results[x]
        	if(result.movie) things.push(result.movie.title)
        	if(result.directors){
        		for (y in result.directors){
        			things.push(result.directors[y].name)
        		}
        	}
        }
        cb(null, _.unique(things))
    });
}
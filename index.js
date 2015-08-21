var    csv = require('fast-csv'),
    _ = require('underscore'),
    cheerio = require('cheerio'),
    Asteroid = require("asteroid");

var movies = [],
	headers = ['embed','src','categories','rating','title','tags','duration','none','thumbnail','images'];

var mt = new Asteroid("localhost:9000");

var path = '/home/nxcong/Projects/babyparse/export_projects.csv';

    csv
    .fromPath(path, {delimiter : '|',quote :'\\', headers : headers})
    .transform(function(data){
		var _keys = _.keys(data),
            diff = _.difference(headers, _keys);
		if(_.size(diff) <= 0){
			var tags = data.tags.split(';'),
                    images = data.images.split(';'),
                    categories = data.categories.split(';') || [''],
                    duration = parseInt(data.duration),
					rating = parseInt(data.rating),
                    $ = cheerio.load(data.embed),
                    src = $('iframe').attr('src'),
                    id = src.substring(src.lastIndexOf('/')+1);            
                    
                return {
					movieId : id,
					title : data.title,
					thumbnail : data.thumbnail,
					images : images,
					embed : src,
					src : data.src,
					categories : categories,
					tags : tags,
					duration : duration
				};
		}
     })
    .on("data", function(data){
         movies.push(data);
    })
    .on("end", function(){
		var updated = 0, total = _.size(movies);
		_.each(movies, function(movie){
			var ret = mt.call('importMovieFromCSV',movie);
                ret.result
                    .then(function (result) {                        
                        ++updated;
                        console.log(path + ' :' + total + ' records, has updated : ' + updated);
                    }).catch(function (error) {
                      console.error('Error:', error);
                    });  
		})
    });

//stream.pipe(csvStream);

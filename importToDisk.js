var fs = require('fs'),
    _ = require('underscore'),
    path = require('path'),
    csv = require('fast-csv'),
    cheerio = require('cheerio'),
    //db = require('diskdb'),
    Asteroid = require("asteroid");
    rootDir = '/D/Projects/pornhub-csv/',
    csvPaths = [];

//db.connect('/D/Projects/pornhub-csv/babyparse/db', ['movies']);
//var options = {
//    multi: false,
//    upsert: true
//}

var mt = new Asteroid("localhost:3000");

fs.readdir(rootDir, function(err, files) {
	if (err) return;
	_.each(files, function(f){
        if(f.substring(0,1) === '.') return;
        if(f.lastIndexOf('.part.') > -1) csvPaths.push(path.join(rootDir, f));
    });
    
    _.each(csvPaths.slice(20,25), function(p){
        importToDB(p, function(movies){
                var updated = 0, total = _.size(movies);
                _.each(movies, function(movie){
                  var ret = mt.call('importMovie',movie);
                    ret.result
                        .then(function (result) {                        
                            ++updated;
                            console.log(p + ' :' + total + ' records, has updated : ' + updated);
                        }).catch(function (error) {
                          console.error('Error:', error);
                        });  
            });           
        })
    })
    
});
var headers = ["iframe", "thumbnail", "images", "title", "tags", "categories", "none", "duration"];
function importToDB(path, cb){
    try{
        var movies = [];
        csv
            .fromPath(path, {delimiter : '|',quote :'\\', headers : headers})
            .transform(function(data){
                var _keys = _.keys(data),
                    diff = _.difference(headers, _keys);
                if(_.size(diff) <= 0){
                                     var tags = data.tags.split(';'),
                    images = data.images.split(';'),
                    categories = data.categories.split(';'),
                    duration = parseInt(data.duration),
                    $ = cheerio.load(data.iframe),
                    src = $('iframe').attr('src'),
                    id = src.substring(src.lastIndexOf('/')+1);            
                    var movie = _.extend(_.omit(data, 'iframe','none'),{movieId : id,images : images,tags : tags, categories : categories, duration : duration});
                    
                return movie;
                }
             })
            .on("data", function(movie){
                if(Math.floor(+(movie.duration/60)) >= 5){
                    movies.push(movie);
                }
            })
            .on('error', function(error) {
                console.log('error file', path);
                console.log("Catch an invalid csv file!!!", error);
                return;                
            })
            .on("end", function(){
                cb(movies);
            });
    }catch(ex)
    {
        console.error('error :'+ ex)
    }
}

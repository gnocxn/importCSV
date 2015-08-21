var thinky = require('thinky')();
var type = thinky.type;

var Movie = thinky.createModel('Movie',{
    id : type.string(),
    title : type.string(),
    thumbnail : type.string(),
    images : [type.string()]
    iframe : type.string(),
    duration : type.number()
});

var Category = thinky.createModel('Category',{
    id : type.string(),
    name : type.string()
});

var Tag = thinky.createModel('Tag',{
    id : type.string(),
    name : type.string()
});

Movie.hasAndBelongsToMany(Category, "categories", "id", "id");
Movie.hasAndBelongsToMany(Tag, "tags", "id", "id");

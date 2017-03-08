var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var knex = require('../db/knex');
var cookieSession = require('cookie-session');
var unirest = require('unirest');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Andrew\s Albums'})
});

router.post('/api/spotify/search', function(req, res, next) {
  if(req.body.artistSearch.length < 1) {
  var query = req.body.titleSearch.replace(/ /g,"%20");
  unirest.get('http://api.spotify.com/v1/search?type=album&q=' + query).end(function(data) {
    var obj = JSON.parse(data.raw_body);
    console.log(obj.albums.items);
    var arr = [];
    for(var x in obj.albums.items){
      arr.push([obj.albums.items[x].name, obj.albums.items[x].images[0].url, obj.albums.items[x].artists[0].name, obj.albums.items[x].id])
    }
    res.render('spotifyResults', {data: arr});
  });
} else if (req.body.titleSearch.length < 1) {
    var query = req.body.artistSearch.replace(/ /g,"%20");
    unirest.get('https://api.spotify.com/v1/search?type=artist&q=' + query).end(function(data) {
      var obj = JSON.parse(data.raw_body);
      console.log(obj.artists.items);
      var arr2 = [];
      for(var x in obj.artists.items){
        arr2.push([obj.artists.items[x].name, obj.artists.items[x].id])
      }
      console.log(arr2);
      res.render('spotifyArtistResults', {data: arr2});
  })
  }
});

router.get('/albums/searchArtists/:artistId', function(req, res, next) {
  unirest.get('https://api.spotify.com/v1/artists/' + req.params.artistId + '/albums/').end(function(data) {
    var obj = JSON.parse(data.raw_body).items;
    var idArr = [];
    for (var i = 0; i < obj.length; i++) {
      idArr.push(obj[i].id);
    };
    var idStr = idArr.join(',');
    var url = 'https://api.spotify.com/v1/albums?ids=' + idStr;
    unirest.get(url).end(function(data){
      var dataArr2 = [];
      var counter = 1;
      var songArr1 = [];
      var obj2 = JSON.parse(data.raw_body).albums;
      for (var i = 0; i < obj2.length; i++) {
        songArr = [];
        counter = 1;
        dataArr2.push([obj2[i].name,
        obj2[i].images[0].url,
        obj2[i].artists[0].name,
        obj2[i].id,
        obj2[i].popularity,
        obj2[i].release_date,  obj2[i].genres[0]]);
        for(var x in obj2[i].tracks.items){
        songArr.push(' ' + counter + '. ' + obj2[i].tracks.items[x].name);
        counter++
        }
        dataArr2[i].push(songArr)
      }
      console.log(dataArr2);
      res.render('spotifyResults', {data: dataArr2});
      // console.log(dataArr2);
  });
  });
});
// /v1/albums?ids={ids}


router.post('/api/spotify/artistSearch', function(req, res, next) {

})

router.post('/selectAlbum/add', function(req, res, next) {
  knex('albums')
  .returning('id')
  .insert(req.body, 'id').then(function(data){
    console.log(data);
    knex('albums_users').insert({user_id: req.session.id, album_id: data[0]}).then(function(){
      knex('albums_users').returning('album_id').where({user_id: req.session.id}).fullOuterJoin('albums', 'albums.id', 'albums_users.album_id').fullOuterJoin('users', 'users.id', 'albums_users.user_id').then(function(data){
        res.render('albums', {albums: data, greeting: req.session.user_name})
      });
    });
  })
})

router.get('/selectAlbum/:albumId', function(req, res, next) {
  unirest.get('https://api.spotify.com/v1/albums/' + req.params.albumId).end(function(data){
    var obj = JSON.parse(data.raw_body);
    var selectedArr = [];
    var songArr = [];
    var counter = 1;
    selectedArr.push(obj.artists[0].name);
    selectedArr.push(obj.name);
    selectedArr.push(obj.popularity);
    selectedArr.push(parseInt(obj.release_date));
    selectedArr.push(obj.images[0].url);
    for(var x in obj.tracks.items){
    songArr.push(' ' + counter + '.' + ' ' + obj.tracks.items[x].name);
    counter++
    }
    for (var i = 0; i < songArr.length; i++) {
      songArr[i].replace(songArr[i][0], 'i + 1 + songArr[i]')
    }
    res.render('selectAlbum', {data: selectedArr
      , songData: songArr
    });
  })

})

router.get('/logout', function(req, res) {
    req.sessionOptions.maxAge = 0;
    req.session = null;
    res.redirect('/');
});

router.get('/albums/logout', function(req, res) {
    req.sessionOptions.maxAge = 0;
    req.session = null;
    res.redirect('/');
});

router.get('/users/login', function(req, res, next) {
  res.render('login')
});

router.get('/users/register', function(req, res, next) {
  res.render('register')
});

router.post('/index/users/login', function(req, res, next) {
  knex('users')
  .where({user_name:req.body.user_name}).then(function(data){
    console.log(data);
    bcrypt.compare(req.body.password, data[0].password, function (err, result) {
      if (err) next (err);
        else if (result && data[0].is_admin)
         {
          req.session.id = data[0].id;
          req.session.user_name = data[0].user_name;
          req.session.isAdmin = data[0].is_admin;
          res.redirect('/admin/loginsuccess/' + data[0].user_name);
        } else if (result && !data[0].is_admin) {
          req.session.id = data[0].id;
          req.session.user_name = data[0].user_name;
          req.session.isAdmin = data[0].is_admin;
          res.redirect('/users/loginsuccess/' + data[0].user_name)
        }
          else {
          res.redirect('/');
        }
    })
  })
});
router.get('/error', function (req, res, next) {
  res.render('error', {errorMessage: 'username taken'})
});

router.post('/users/register', function(req, res, next){
  knex('users').where({user_name: req.body.user_name}).then(function(data){
    if (data[0] == undefined) {
      bcrypt.hash(req.body.password, 8, function(err, hash) {
        knex('users').returning(['user_name', 'id', 'is_admin']).insert({user_name: req.body.user_name, first_name: req.body.first_name, last_name: req.body.last_name, password:hash, is_admin:false}).then(function(data) {
          req.session.id = data[0].id;
          req.session.user_name = data[0].user_name;
          req.session.isAdmin = data[0].is_admin;
          res.redirect('/users/registersuccess/' + req.session.user_name)
        })
      })
    } else {
      res.redirect('/error')
    }
  })
});

module.exports = router;

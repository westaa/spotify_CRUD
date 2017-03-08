var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var knex = require('../db/knex');
var cookieSession = require('cookie-session');
/* GET users listing. */

router.get('/loginsuccess/:username', function(req, res, next) {
  res.render('userLoginSuccess', {greeting: req.session.user_name})
});

router.get('/registersuccess/:username', function (req, res, next) {
  if (req.session.user_name){
    res.render('registersuccess', {greeting: req.session.user_name})
  } else {
    res.render('registersuccess', {greeting: req.session.user_name})
  }
});

router.get('/albums/:greeting', function (req, res, next) {
  knex('albums_users')
  .returning('album_id').where({user_id: req.session.id}).fullOuterJoin('albums', 'albums.id', 'albums_users.album_id').fullOuterJoin('users', 'users.id', 'albums_users.user_id').then(function(data){
    console.log(data);
    res.render('albums', {albums: data, greeting: req.session.user_name})
  })
});

router.get('/albums/new/:greeting', function(req, res, next) {
  res.render('addAlbum', {greeting: req.session.user_name})
});

router.get('/api/spotify', function(req, res, next) {
  res.render('searchSpotify');
});

module.exports = router;

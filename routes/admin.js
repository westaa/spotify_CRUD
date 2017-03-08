var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var knex = require('../db/knex');
var cookieSession = require('cookie-session');

router.get('/loginsuccess/:username', function(req, res, next) {
  if (req.session.isAdmin) {
    res.render('adminLoginsuccess', {greeting: req.session.user_name})
  }
  else if (!req.session.isAdmin){
    res.render('userLoginSuccess', {greeting: req.session.user_name})
  }
});

router.get('/api/spotify', function(req, res, next) {
  res.render('searchSpotify');
});

router.get('/users/:greeting', function (req, res, next) {
  if(!req.session.isAdmin) {
    res.redirect('/users/loginsuccess/' + req.session.user_name)
  }
  knex('users').then(function(data) {
  res.render('users', {users: data, greeting: req.session.user_name});
})
});

router.get('/albums/:greeting', function (req, res, next) {
  knex('albums_users').returning('album_id').where({user_id: req.session.id}).fullOuterJoin('albums', 'albums.id', 'albums_users.album_id').fullOuterJoin('users', 'users.id', 'albums_users.user_id').then(function(data){
    res.render('albums', {albums: data, greeting: req.session.user_name})
  });
});

router.get('/albums/new/:greeting', function(req, res, next) {
  res.render('addAlbum', {greeting: req.session.user_name})
});

router.post('/albums/new/:greeting', function(req, res, next) {
  knex('albums')
    .returning('id')
    .insert(req.body).then(function(data){
      knex('albums_users')
      .insert({album_id: data[0], user_id: req.session.id}).then(function() {
        knex('albums_users').where('user_id', req.session.id)
        .fullOuterJoin('albums', 'albums.id', 'albums_users.album_id').fullOuterJoin('users', 'users.id', 'albums_users.user_id').then(function(data){
          res.render('albums', {albums: data, greeting: req.session.user_name})
          });
        })
      });
});

router.get('/:userid/edit', function(req, res, next) {
  knex('users').where({id: req.params.userid}).then(function(data){
    if (!data[0].is_admin) {
    data[0].is_admin = 'false';
  } else {
    data[0].is_admin = 'true'
  }
    res.render('editUser.jade', {user1: data[0]});
  });
});

router.get('/albums/delete/:albumid',
function(req, res, next) {
  knex('albums')
  .where({id: req.params.albumid}).del()
  .then(function(){
  knex('albums_users').where({album_id: req.params.albumid}).where({user_id: req.session.id}).del().then(function() {
    knex('albums_users').returning('album_id').where({user_id: req.session.id}).fullOuterJoin('albums', 'albums.id', 'albums_users.album_id').fullOuterJoin('users', 'users.id', 'albums_users.user_id').then(function(data){
    res.render('albums', {albums: data, greeting: req.session.user_name})
    });
  });
});

});

router.get('/albums/:albumid/edit', function(req, res, next){
  knex('albums').where('id', req.params.albumid).then(function(album){
  res.render('editAlbum', {album: album[0]});
  })
});

router.post('/albums/:albumid/edit', function(req, res, next){
  knex('albums').where('id', req.params.albumid).update(req.body).then(function(){
    res.redirect('/admin/albums/' + req.session.user_name);
  });
});

router.get('/:userid/delete', function(req, res, next) {
  knex('users').where({id: req.params.userid}).delete().then(function(data){
    res.redirect('/admin/users/' + req.session.user_name)
  });
});

router.post('/:userid/edit', function(req, res, next) {
  knex('users').where({id: req.params.userid}).update(req.body).then(function() {
    res.redirect('/admin/users/' + req.session.user_name)
  })
});

module.exports = router;

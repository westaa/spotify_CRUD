exports.up = function(knex, Promise) {
  return knex.schema.createTable('albums_users', function(table){
    table.increments('id').primary();
    table.integer('user_id');
    table.integer('album_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('albums_users');
};

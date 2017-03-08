
exports.up = function(knex, Promise) {
  return knex.schema.createTable('albums', function(table){
    table.increments('id').primary();
    table.string('artist');
    table.string('title');
    table.integer('year');
    table.string('genre');
    table.string('image_url')
    table.integer('rating');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('albums');
};

var bcrypt = require('bcryptjs');

exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),
    // Inserts seed entries
    knex('users').insert({
        user_name: 'andrew',
        first_name: 'andrew',
        last_name: 'west',
        password: bcrypt.hashSync('test', 8),
        is_admin: true
    })
  );
};

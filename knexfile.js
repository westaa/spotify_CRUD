// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: 'postgres://localhost:5432/express_auth'
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL
  }
};

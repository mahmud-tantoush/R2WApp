
const neo4j = require('neo4j-driver');
const config = require('./config');

// Create Driver
const driver = neo4j.driver(
    config.DATABASE_URL,
    neo4j.auth.basic(
      config.DATABASE_USER,
      config.DATABASE_PSWRD,
    )
)

//console.log(driver)

module.exports = driver
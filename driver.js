
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

// dbLoc = 'bolt://eric.myvnc.com:7687'
// dbUsername = 'neo4j'
// dbPassword = 'quarterdecks-woods-banks'
// var driver = neo4j.driver(
// dbLoc,
// neo4j.auth.basic(dbUsername, dbPassword)
// , {
// trust: 'TRUST_ALL_CERTIFICATES',
// encrypted: 'ENCRYPTION_ON'
// }
// )

//console.log(driver)

module.exports = driver

const neo4j = require('neo4j-driver');

// Create Driver
const driver = neo4j.driver(
    'bolt://52.87.235.130:32924', 
    neo4j.auth.basic(
        'neo4j', 
        'quarterdecks-woods-banks'
    )
)

// Express middleware
module.exports = function(req, res, next) {
  req.driver = driver;

  next();
};

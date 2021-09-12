/*
 * Contains default config.
 * This can be overriden using environment variables
 */

module.exports = {
    DATABASE_URL: process.env.DATABASE_URL || 'bolt://neo4j-db:7687', 
    DATABASE_USER: process.env.DATABASE_USER || 'neo4j', 
    DATABASE_PSWRD: process.env.DATABASE_PSWRD || 'test',
    PORT: process.env.PORT || 5050,
    SECRET: process.env.SECRET || 'NOTFORPRODUCTION',
    CLIENT_KEY: process.env.CLIENT_KEY || 'NOTFORPRODUCTION',
    VERSION: process.env.npm_package_version || 'UNKNOWN VERSION',
  } 
  
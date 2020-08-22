var dbLoc = 'bolt://localhost:7687'
var dbUsername = 'neo4j'
var dbPassword = 'Demo_Data_Rev1'


var driver = neo4j.driver(
    dbLoc,
    neo4j.auth.basic(dbUsername, dbPassword)
)



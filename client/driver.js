dbLoc = 'bolt://localhost:7687'
dbUsername = 'neo4j'
dbPassword = 'Demo_Data_Rev1'
//var dbLoc = 'neo4j://35.209.55.87:7687'
//var dbUsername = 'neo4j'
//var dbPassword = 'R2W'

var driver = neo4j.driver(
    dbLoc,
    neo4j.auth.basic(dbUsername, dbPassword)
)



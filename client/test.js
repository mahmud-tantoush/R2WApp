console.log('hello')

var dbLoc = 'bolt://hobby-ejfophcjhphmgbkeandgnhfl.dbs.graphenedb.com:24787'
var dbUsername = 'user'
var dbPassword = 'b.J0gmdmvPgdIy.YjvKK5VQNaTZlovw'

var driver = neo4j.driver(
    dbLoc,
    neo4j.auth.basic(dbUsername, dbPassword),
    {encrypted: 'ENCRYPTION_ON'}
)

var session = driver.session();

//get properties for each case in db     var=DBlist
session
    .run(`create (n:Case {caseID: 'one'}) return n`)
    .then((result) => {
        session.close();
        console.log(result)
    })
    .catch(e => {
        session.close();
        throw e
    });
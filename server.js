const express = require('express');
const cors = require('cors')
const neo4j = require('neo4j-driver');
//const neo4JDriver = require('./neo4j')

const app = express();

//boady-parser middleware
app.use(express.json())
//app.use(cors())
//app.use(neo4JDriver);

// use routes
//app.use('/api/cases', require('./routes/api/cases'))
//app.use('/api/actions', require('./routes/api/actions'))
//app.use('/api/graph', require('./routes/api/graph'))

// Create Driver

var driver = neo4j.driver('bolt://52.87.235.130:32924', neo4j.auth.basic('neo4j', 'quarterdecks-woods-banks'));

var query = 
  "MATCH (n) \
   RETURN n \
   LIMIT $limit";

var params = {"limit": 25};

var session = driver.session();

session.run(query, params)
  .then(function(result) {
    result.records.forEach(function(record) {
        //console.log(record._fields[0].properties);
    })
    console.log('connected to remote DB')
  })
  .catch(function(error) {
    console.log(error);
  })
  .then(() => {
      session.close()
  });

//get all node data
//http://localhost:5050/
app.get('/', (req,res) => {
    var session = driver.session();
    session
        .run('MATCH (n) RETURN n LIMIT 25')
        .then(result => {
            var arr = []
            result.records.forEach(function(record){
                arr.push({
                    id: record._fields[0].identity.low,
                    properties: record._fields[0].properties
                })
            })
            //console.log(arr)
            res.send(arr);
        })
        .catch(e => {
            console.log(e)})
        .then( ()=> { session.close()})
    //res.send('it works')
})

app.post('/api/addaction', (req,res) => {
    var session = driver.session();
    var newAction = req.body.type

    //console.log(newAction)

    const qString = `create (n:Action {type: "${newAction}"}) return n`
    console.log(qString)
    //res.send('accessed')
    session
        .run(qString)
        .then(() => {
            console.log(`created Action type: ${newAction}`)
        })
        .then(item => res.json(`Action created type: ${newAction}`))
        .catch(e => {console.log(e)})
        .then(()=>{session.close()})
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`server started on port ${port}`))

/*
const driver = neo4j.driver(
    'bolt://localhost:7687', 
    neo4j.auth.basic(
        'neo4j', 
        'R2W'
        ))
        
const driver = neo4j.driver(
    'bolt://52.87.235.130:32924', 
    neo4j.auth.basic(
        'neo4j', 
        'quarterdecks-woods-banks'
    )
)

const driver = neo4j.driver(
    'bolt://hobby-ejfophcjhphmgbkeandgnhfl.dbs.graphenedb.com:24787', 
    neo4j.auth.basic(
        'mahmud', 
        'b.eUXWi6RJ1XG0.MUPdzKcS3UvdXsJW'
        )) 
*/
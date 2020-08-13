const express = require('express');
const cors = require('cors')
const neo4j = require('neo4j-driver');
require('dotenv').config()
const config = require('./config');
var _ = require('lodash');
const driver = require('./driver')

const app = express();

//boady-parser middleware
app.use(express.json())
app.use(cors())
//app.use(neo4JDriver);

// use routes
app.use('/api/cases', require('./routes/api/cases'))
app.use('/api/actions', require('./routes/api/actions'))
app.use('/api/graph', require('./routes/api/graph'))

//data models
var Case = require('./models/Case');

// initial connection check
var session = driver.session();
session.run("MATCH (n) RETURN n LIMIT 1")
  .then(() => {
    console.log('connected to remote DB')
  })
  .catch((error) => {
    console.log(error);
  }).then (() => {
    session.close()
    //console.log('session closed')
  }) 

function GetCase (c){
    //returns object model Case
    //console.log('got here')
    var session = driver.session();
    const qString = `Match (n:Case {caseId: ${c}}) return n`

    session
        .run(qString)
        .then((result) => {
            //console.log(result.records[0]._fields[0])
            session.close()

            if (_.isEmpty(result.records)){
                //console.log('not right call')
                return null;    
            }

            var record = result.records[0]._fields[0].properties;
            //console.log(record)
            console.log(new Case(record.caseId, record.location, record.start_date))
            return(new Case(3000, record.location, record.start_date))
        })
        .catch(e => {
            session.close();
            throw e
        });
}

//GetCase(2002)

app.get('/', (req,res) => {
    var session = driver.session();
    session
        .run('MATCH (n) RETURN n LIMIT 10')
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
            console.log(e)
        })
        .then ( () => {
            session.close()
            }) 
})

const port = config.PORT

app.listen(port, () => console.log(`server started on port ${port}`))
const express = require('express');
const router = express.Router()
const neo4j = require('neo4j-driver');

//@route Get api/cases
//@desc  Get all Cases
//access Public

router.get('/getall', (req,res) => {
    // Create Driver session
    var session = req.driver.session();

    session
        .run('MATCH (n:Action) RETURN n LIMIT 25')
        .then(result => {
            var arr = []
            result.records.forEach(function(record){
                arr.push({
                    id: record._fields[0].identity.low,
                    type: record._fields[0].properties.type
                })
            })
            session.close()
            console.log(arr)
            res.send(arr);

        })
        .catch(e => {
            session.close()
            console.log(e)})
})

router.post('/addAction', (req,res) => {
    var session = req.driver.session();
    var newAction = req.body.type

    const qString = `create (n:Action {type: "${newAction}"}) return n`
    //console.log(caseString)
    session
        .run(qString)
        .then(() => {
            console.log(`created Action type: ${newAction}`)
            return session.close();
        })
        .then(item => res.json(`Action created type: ${newAction}`))
        .catch(e => {console.log(e)})
})

module.exports = router
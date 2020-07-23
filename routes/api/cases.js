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
        .run('MATCH (n:Case) RETURN n LIMIT 25')
        .then(result => {
            var arr = []
            result.records.forEach(function(record){
                arr.push({
                    id: record._fields[0].identity.low,
                    properties: record._fields[0].properties
                })
            })
            console.log(arr)
            res.send(arr);
            return session.close();
        })
        .catch(e => {console.log(e)})
        .then(() => {
            // Close the session
        });
})

router.post('/addCase', (req,res) => {
    var session = req.driver.session();
    var newCase = req.body.caseID
    const qString = `create (n:Case {caseID: ${newCase}}) return n`
    //console.log(caseString)
    session
        .run(qString)
        .then(result => {
            console.log(`created case with caseID: ${newCase}`)
            return session.close();
        })
        .then(item => res.json(`case created with caseID: ${newCase}`))
        .catch(e => {console.log(e)})
})


module.exports = router
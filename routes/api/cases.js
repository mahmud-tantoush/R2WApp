const express = require('express');
const router = express.Router()
const driver = require('../../driver')

//@route Get api/cases
//@desc  Get all Cases
//access Public
router.get('/getall', (req,res) => {
    // Create Driver session
    var session = driver.session();
    session
        .run('MATCH (n:Case) RETURN n LIMIT 25')
        .then(result => {
            session.close();
            var arr = []
            result.records.forEach(function(record){
                arr.push({
                    id: record._fields[0].identity.low,
                    properties: record._fields[0].properties
                })
            })
            console.log(arr)
            res.send(arr);
        })
        .catch(e => {
            session.close();
            console.log(e)
        })
})

//@route Get api/cases
//@desc  Get all Cases
//access Public
router.post('/addCase', (req,res) => {
    var session = driver.session();
    var newCase = req.body.caseId
    const qString = `create (n:Case {caseID: ${newCase}}) return n`
    //console.log(caseString)
    session
        .run(qString)
        .then((result) => {
            console.log(`created case with caseID: ${newCase}`)
            return session.close();
        })
        .then(item => res.json(`case created with caseID: ${newCase}`))
        .catch(e => {console.log(e)})
})

//@route Post api/cases
//@desc  Get a Case with caseID
//access Public
router.post('/getcase', (req,res) => {
    var session = driver.session();
    var caseID = req.body.caseID

    const qString = `Match (n:Case {caseId: ${caseID}}) return n`
    //console.log(qString)
    session
        .run(qString)
        .then((result) => {
            console.log(result.records[0]._fields[0])
            res.json(result.records[0]._fields[0])
        })
        .catch(e => {console.log(e)})
        .then(()=>{session.close()})
})

router.use('*', (req, res) => {
    console.log('Invalid api endpoint')
    res.status(403)
    res.send('invalid api endpoint')
})

module.exports = router
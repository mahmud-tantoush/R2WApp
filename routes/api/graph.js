const express = require('express');
const router = express.Router()
const driver = require('../../driver')

//@route Get api/graph
//@desc  Get the graph data
//access Public
router.get('/getall', (req,res) => {
    // Create Driver session
    var session = driver.session();
    session
    .run('MATCH n LIMIT 25')
    .then(results => {
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
})

router.use('*', (req, res) => {
    console.log('Invalid api endpoint')
    res.status(403)
    res.send('invalid api endpoint')
})

module.exports = router;
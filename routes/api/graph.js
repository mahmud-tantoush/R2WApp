const express = require('express');
const { session } = require('neo4j-driver');
const router = express.Router()

//@route Get api/graph
//@desc  Get the graph data
//access Public
router.get('/graph', (req,res) => {
    // Create Driver session
    const session = req.driver.session();

    session
    .run('MATCH n LIMIT {limit}', {limit: 100})
    .then(results => {
        console.log(results.records)
        session.close();
    });
}

module.exports = router;
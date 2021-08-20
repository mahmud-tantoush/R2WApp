const express = require('express');
const router = express.Router();
const driver = require('../driver.js');

//get
router.get(`/getcase/:caseID`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.params)
    const session = driver.session()
    q = `MATCH (n:Case {caseID:'${req.params.caseID}'}) RETURN n`
    console.log(q)
    session.run(q) 
      .then(result => {
        //console.log(result)
        session.close();
        res.json(result.records)
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

//get 
router.get(`/getcases`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    const session = driver.session()
    session.run(`Match (n:Case) return n`)
      .then(result => {
        session.close();
        //console.log(result.records)
        DBlist = []
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            DBlist.push(record._fields[0])
        })
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

module.exports = router;
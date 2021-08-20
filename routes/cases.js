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


//get
router.get(`/getcaseevent/:caseID`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.params)
    const session = driver.session()
    
    q = `MATCH (p:Case {caseID: '${req.params.caseID}'}) 
CALL apoc.path.subgraphAll(p, {relationshipFilter: ">", minLevel: 0, maxLevel: 100 })
YIELD nodes, relationships
unwind(nodes) as node
RETURN  distinct collect([node]) as nodes, [relationships] as relationships`

    //console.log(q)
    session.run(q) 
      .then(result => {
        //console.log(result)
        session.close();
        
        try{
          //assume it goes ok with [0:nodes,1:relations]
          var getnodes_per_record = result.records.map(record => record._fields[0]);
          var getrelations_per_record = result.records.map(record => record._fields[1]);

          //console.log(getnodes);
          var nodes = [];
          var edges = [];

          //converts identify to number in javascript
          function toNumber({ low, high }) {
            let res = high
            for (let i = 0; i < 32; i++) {
              res *= 2
            }
            return low + res
          }
          
          getnodes_per_record.forEach(function(getnodes){
              getnodes.forEach(function(tmpnode1){
                tmpnode1.forEach(function(tmpnode){
                    //console.log(tmpnode);
                    //console.log(toNumber(tmpnode['identity']));
                    //console.log(tmpnode['labels']);
                    //console.log(tmpnode['properties']);
                    nodes.push({
                      'id': toNumber(tmpnode['identity']), 
                      'labels':tmpnode['labels'],
                      'properties':tmpnode['properties']
                    })
                });
              });
          });
          getrelations_per_record.forEach(function(getedges){
              getedges.forEach(function(tmpedge1){
                tmpedge1.forEach(function(tmpedge){
                  //console.log(tmpedge);
                  ///*
                  edges.push({
                    'id': toNumber(tmpedge['identity']), 
                    'startNodeId':toNumber(tmpedge['start']),
                    'endNodeId':toNumber(tmpedge['end']),
                    'type':tmpedge['type'],
                    'properties':tmpedge['properties']
                  })
                  //*/
                });
              });
          });
          
          
          
          output = {"nodes":nodes,"edges":edges};

          res.json(output)
          
        }
        catch(e){
          console.log(e);
          res.send(error)
        }
        
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

module.exports = router;
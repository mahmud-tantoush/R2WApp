const express = require('express');
const router = express.Router();
const driver = require('../driver.js');
const fetch = require('node-fetch');
const axios = require('axios')

//general utility: converts identify to number in javascript
function toNumber({ low, high }) {
    let res = high
    for (let i = 0; i < 32; i++) {
      res *= 2
    }
    return low + res
}


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
        // res.json(result.records)
        res.json(result.records[0]._fields[0].properties)
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

//get: check if a caseID exists
router.get(`/caseexists/:caseID`, (req, res)=>{

    console.log(req.params)
    const session = driver.session()
    q = `MATCH (n:Case {caseID:'${req.params.caseID}'}) RETURN count(n) as len`
    console.log(q)
    session.run(q) 
      .then(result => {
        //console.log(result)
        session.close();
        count_of_caseID = toNumber(result.records[0]._fields[0]);
        res.json(count_of_caseID)
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

//post
router.post(`/updatecase/:caseID`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    //var newCase = JSON.parse(JSON.stringify(req.body))
    var param = req.body;
    delete param['caseID']
    
    var caseID = req.params.caseID; //note: if the caseID does not exist, no changes in n4j
    var tmp = []
    var setStr = "";
    for (var key in param){
        tmp.push(`n.${key} = "${param[key]}"`) //force all as string, we will need to check these to avoid special characters
    }
    if (tmp.length){
        setStr = "SET "+ tmp.join(",");
        
        q = `MATCH (n) WHERE n.caseID = "${caseID}" ${setStr}`;
        console.log(q)
        
        const session = driver.session()
        session.run(q) 
        .then(result => {
            session.close();
            res.json({status: 1, message: `Update case record: ${caseID}`, data: param })
        })
        .catch(error => {
          session.close();
          res.send(error)
        })
    }
  
})


//post
router.post(`/createcase`, (req, res)=>{

  var existingCases = []
    //console.log('/api/v1/getcases link works')
    //var newCase = JSON.parse(JSON.stringify(req.body))
    var newCase = JSON.stringify(req.body)
    var newCase = newCase.replace(/"([^"]+)":/g, '$1:');

    q1 = "MATCH (p:Case {caseID: '"+req.body['caseID']+"'}) return count(p) as len"
    q2 = `CREATE (n:Case ${newCase}) return n`
    q = [q1,q2]

    
    //q = `CREATE (n:Case ${newCase}) return n`
    console.log(q)
    const session = driver.session()
    
    function exec_query(idx){
        session.run(q[idx]) 
        .then(result => {
           if(idx == 0){
              count_of_caseID = toNumber(result.records[0]._fields[0]);
              if (count_of_caseID == 0){
                //go ahead and add the new case
                exec_query(1)
              }else{
                console.log("exists")
                res.json({status: 0, message: 'caseID already exists'})
              }
           }else{
               res.json({status: 1, message: 'new case with properties created'})
               session.close();
           }
        })
        .catch(error => {
          session.close();
          res.send(error)
        })
    }
    exec_query(0)
    
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
        }
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
      
})

module.exports = router;
const express = require('express');
const router = express.Router();
const driver = require('../driver.js');

//general utility: converts identity to number in javascript
function toNumber({ low, high }) {
    let res = high
    for (let i = 0; i < 32; i++) {
      res *= 2
    }
    return low + res
}
//general utility: converts json to n4j format
function process_json_n4j(jsondata){
    return JSON.stringify(jsondata).replace(/"([^"]+)":/g, '$1:');
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
            res.json({status: 1, message: `Update case record: ${caseID}`})
        })
        .catch(error => {
          session.close();
          res.send(error)
        })
    }
})

//post
//move this to event?
//Update attributes in an Event
router.post(`/updateevent/:eventID`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    //var newCase = JSON.parse(JSON.stringify(req.body))
    var param = req.body;
    
    var nID = req.params.eventID; //note: this uses the actual internal id, may be problematic
    var tmp = []
    var setStr = "";
    for (var key in param){
        tmp.push(`n.${key} = "${param[key]}"`) //force all as string, we will need to check these to avoid special characters
    }
    if (tmp.length){
        setStr = "SET "+ tmp.join(",");
        
        q = `MATCH (n) WHERE ID(n) = ${nID} ${setStr}`;
        console.log(q)
        
        const session = driver.session()
        session.run(q) 
        .then(result => {
            session.close();
            res.json({status: 1, message: `Update event record: ${nID}`})
        })
        .catch(error => {
          session.close();
          res.send(error)
        })
    }
})

//post
//move this to event?
//Add a new Event to a Case by caseID
router.post(`/addevent/:caseID`, (req, res)=>{
    
    var caseID = req.params.caseID;
    var param = process_json_n4j(req.body);

/*
    q = `
MATCH (a) where a.caseID = '20001'
MERGE (b:Event 
{
    Label: "Nal Committee Formation",
    Completed: "true",
    eventStartDate: "2020-01-08",
    eventCompletedDate: "2020-01-15",
    eventDueDate: "2020-01-15",
    Expected_Duration: "7"
}
)
MERGE (a) -[r1:HAS]-> (b)
return ID(b)
`;
*/
    q = `MATCH (a) where a.caseID = '${caseID}'
CREATE (b:Event ${param})
MERGE (a) -[r1:HAS]-> (b)
return ID(b)`;

    console.log(q)

    const session = driver.session()
    session.run(q) 
    .then(result => {
        session.close();
        console.log(result);
        //res.json(result);
        neweventid = toNumber(result.records[0]._fields[0]);
        
        res.json({status: 1, message: `New event: ${neweventid}`, data: neweventid});
    })
    .catch(error => {
      session.close();
      res.send(error)
    })

})

router.post(`/addevent/:caseID/:eventID`, (req, res)=>{
    
    var caseID = req.params.caseID; // properties 
    var prevEventID = req.params.eventID; //node id
    var param = process_json_n4j(req.body);

/*
    q = `
MATCH (a) where a.caseID = '20006'
MATCH (c:Event) where ID(c) = 233
MERGE (b:Event 
{
    Label: "Nal Committee Formation",
    Completed: "true",
    eventStartDate: "2020-01-08",
    eventCompletedDate: "2020-01-15",
    eventDueDate: "2020-01-15",
    Expected_Duration: "7"
}
)
MERGE (a) -[r1:HAS]-> (b)
MERGE (c) -[r2:NEXT]-> (b)
return ID(b)
`;
*/
    q = `
MATCH (a) where a.caseID = '${caseID}'
MATCH (c:Event) where ID(c) = ${prevEventID}
CREATE (b:Event ${param})
MERGE (a) -[r1:HAS]-> (b)
MERGE (c) -[r2:NEXT]-> (b)
return ID(b)
`;

    console.log(q)

    const session = driver.session()
    session.run(q) 
    .then(result => {
        session.close();
        console.log(result);
        //res.json(result);
        neweventid = toNumber(result.records[0]._fields[0]);
        
        res.json({status: 1, message: `New event: ${neweventid}`, data: neweventid});
    })
    .catch(error => {
      session.close();
      res.send(error)
    })

})
//post
//move this to event?
//Add a [r:NEXT] relation between Event
//payload = {startNodeId: event_list[i-1]['id'], endNodeId: event_list[i]['id']}

router.post(`/linkevents`, (req, res)=>{
    
    var caseID = req.params.caseID;
    var param = req.body;
    var startNodeId = param.startNodeId; //need error checking here
    var endNodeId = param.endNodeId; //need error checking here
    
    
    q = `
MATCH (a:Event) where ID(a) = ${startNodeId}
MATCH (b:Event) where ID(b) = ${endNodeId}
MERGE (a) -[r1:NEXT]-> (b)
return ID(a),ID(b)`;

    console.log(q)

    const session = driver.session()
    session.run(q) 
    .then(result => {
        session.close();
        console.log(result);
        res.json(result);
        //eventA = toNumber(result.records[0]._fields[0]);
        //eventB = toNumber(result.records[0]._fields[0]);
        
        //res.json({status: 1, message: `New event: ${neweventid}`, data: neweventid});
    })
    .catch(error => {
      session.close();
      res.send(error)
    })

})



//post
router.post(`/createcase`, (req, res)=>{
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


//post
//experimental get a preceding Event from a known caseID and a known Label, for use to suggest next step 

//issues when the event label has special characters
//router.get(`/getnextevent/:caseID/:eventLabel`, (req, res)=>{
    
router.post(`/getnextevent/:caseID`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.params)
    console.log(req.body)
    var caseID = req.params.caseID;
    //var eventLabel = req.params.eventLabel;
    var eventLabel = req.body.Label;
    
    /*
    test
    MATCH (a)-[r1:HAS]-(b)-[r2:NEXT]-(c) where a.caseID = 'templateA' AND b.Label = "Connection Installed" return b,c;
    */
    
    const session = driver.session()
    q = `MATCH (a)-[r1:HAS]-(b)-[r2:NEXT]->(c) where a.caseID = '${caseID}' AND b.Label = "${eventLabel}" return b,c;`
    
    //`MATCH (n:Case {caseID:'${req.params.caseID}'}) RETURN n`
    console.log(q)
    
    session.run(q) 
      .then(result => {
          
          
        console.log("HERE")
        console.log(result.records)
        
        session.close();
        //res.json(result.records)
        
        var tmp = {
            prev: result.records[0]._fields[0].properties,
            next: result.records[0]._fields[1].properties
        }
        res.json(tmp)
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})



module.exports = router;

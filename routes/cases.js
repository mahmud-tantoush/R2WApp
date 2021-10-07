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

router.post(`/search`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.body)
    
    
    if(!"q" in req.body){
      res.send({error:1}); return;
    }
    
    const session = driver.session()
    
    //template~ OR test~
    q = `
CALL db.index.fulltext.queryNodes('case', 'caseID:${req.body.q}') 
YIELD node, score
RETURN node.caseID as caseID, score
`
    console.log(q)
    session.run(q) 
      .then(result => {
        //console.log(result)
        session.close();
        // res.json(result.records)

        DBlist = []
        
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
              //console.log(record.length)
              //console.log(record._fields[i])
            }
            //add post-process here -e.g. if it is an integer we can process it here
            
            DBlist.push(tmp)
            
        })
        //res.json(result.records)
        res.json(DBlist)
        
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
    session.run(`MATCH (n:Case) WHERE COALESCE(n.hidden, 0) <> 1 RETURN n`)
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
router.get(`/getcases/summary/total`, (req, res)=>{
  const session = driver.session()
   session.run(`
 MATCH (n:Case) 
 WHERE COALESCE(n.hidden, 0) <> 1 
 RETURN toFloat(count(n))
   `)
      .then(result => {
        session.close();
        res.json(result.records[0]._fields[0])
        
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})


// normal use to show full list with pagination
router.post(`/getcases/summary/total`, (req, res)=>{
   if(!"q" in req.body){
      res.send({error:1}); return;
    }
    const session = driver.session()
    //template~ OR test~
    q = `
CALL db.index.fulltext.queryNodes('case', 'caseID:${req.body.q}') 
YIELD node
WHERE COALESCE(node.hidden, 0) <> 1 
RETURN toFloat(count(node))
`
   session.run(q)
      .then(result => {
        session.close();
        res.json(result.records[0]._fields[0])
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})


//  use to show list with pagination based on username
router.post(`/getcases/summary/total/:User`, (req, res)=>{
    
   if(!"q" in req.body || !req.params.User){
      res.send({error:1}); return;
    }
    const session = driver.session()
    //template~ OR test~
    q = `
CALL db.index.fulltext.queryNodes('case', 'caseID:${req.body.q}') 
YIELD node
WHERE COALESCE(node.hidden, 0) <> 1 AND node.phsVolunteer = "${req.params.User}"
RETURN toFloat(count(node))
`
   session.run(q)
      .then(result => {
        session.close();
        res.json(result.records[0]._fields[0])
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

//get 
router.get(`/getcases/summary/all`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    const session = driver.session()
    q = `
match (c:Case)
WHERE COALESCE(c.hidden, 0) <> 1 
optional match (c)-[:HAS]->(e:Event)	
with distinct c, count(e) as total,					
REDUCE(s = {completed:0.0, overdue:0.0, ongoing:0.0, error:0.0}, e IN collect(e) |					
CASE					
	WHEN 	e.Completed = "true"  AND e.eventCompletedDate <> "" AND (date(e.eventCompletedDate)  <= date()) AND duration.inDays(date(e.eventStartDate), date(e.eventCompletedDate)).days >= 0			
		THEN 	{completed:s.completed+1, overdue:s.overdue, ongoing:s.ongoing, error:s.error}		
		ELSE 			
			CASE WHEN	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) <= date())	
			THEN 	{completed:s.completed, overdue:s.overdue+1, ongoing:s.ongoing, error:s.error}	
			ELSE 		
				CASE WHEN 	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) > date())
				THEN 	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing+1, error:s.error}
				ELSE	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing, error:s.error+1}
				END	
			END		
		END) AS status	
return c.caseID as caseID,status,toFloat(total) as total
order by total desc					
`
    session.run(q)
      .then(result => {
        session.close();
        //console.log(result.records)
        DBlist = []
        
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
              //console.log(record.length)
              //console.log(record._fields[i])
            }
            //add post-process here -e.g. if it is an integer we can process it here
            
            DBlist.push(tmp)
            
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

//get  superceded
router.get(`/getcases/summary/:Page/:Order`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    
    let page = req.params.Page;
    page = Number(page);
    if (isNaN(page)){
      res.json({error:1});
      return;
    }
    
    
    let orderbycypher = "order by total desc";
    console.log(req.body)
    //if ('order' in req.body){
      //let orderby = req.body['order'];
      let orderby = req.params.Order;
      if (orderby){
        orderbycypher = `order by ${orderby} desc`;
      }
    //}
    
    const session = driver.session()
    q = `
match (c:Case)
WHERE COALESCE(c.hidden, 0) <> 1 
optional match (c)-[:HAS]->(e:Event)	
with distinct c, count(e) as total,					
REDUCE(s = {completed:0.0, overdue:0.0, ongoing:0.0, error:0.0}, e IN collect(e) |					
CASE					
	WHEN 	e.Completed = "true"  AND e.eventCompletedDate <> "" AND (date(e.eventCompletedDate) <= (date()+Duration({days: 1}))) AND duration.inDays(date(e.eventStartDate), date(e.eventCompletedDate)).days >= 0			
		THEN 	{completed:s.completed+1, overdue:s.overdue, ongoing:s.ongoing, error:s.error}		
		ELSE 			
			CASE WHEN	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) <= date())	
			THEN 	{completed:s.completed, overdue:s.overdue+1, ongoing:s.ongoing, error:s.error}	
			ELSE 		
				CASE WHEN 	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) > date())
				THEN 	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing+1, error:s.error}
				ELSE	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing, error:s.error+1}
				END	
			END		
		END) AS status	
return c.caseID as caseID,status.completed as completed,status.overdue as overdue,status.ongoing as ongoing,status.error as error,toFloat(total) as total,c.phsVolunteer as user
${orderbycypher}	
skip ${10*page}
limit 10			
`
//console.log(q)
    session.run(q)
      .then(result => {
        session.close();
        //console.log(result.records)
        DBlist = []
        
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
              //console.log(record.length)
              //console.log(record._fields[i])
            }
            //add post-process here -e.g. if it is an integer we can process it here
            
            DBlist.push(tmp)
            
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        console.log(error);
        error["error"] = 1;
        res.send(error)
      })
})

//post - combines search and summary (requires an index on caseID for Case)
router.post(`/getcases/summary/:Page/:Order`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
   if(!"q" in req.body){
      res.send({error:1}); return;
    }
    
    let page = req.params.Page;
    page = Number(page);
    if (isNaN(page)){
      res.json({error:1});
      return;
    }
    
    let orderbycypher = "order by total desc";
    console.log(req.body)
    //if ('order' in req.body){
      //let orderby = req.body['order'];
      let orderby = req.params.Order;
      if (orderby){
        orderbycypher = `order by ${orderby} desc`;
      }
    
    const session = driver.session()
    q = `
CALL db.index.fulltext.queryNodes('case', 'caseID:${req.body.q}') 
YIELD node as c
WHERE COALESCE(c.hidden, 0) <> 1 
optional match (c)-[:HAS]->(e:Event)	
with distinct c, count(e) as total,					
REDUCE(s = {completed:0.0, overdue:0.0, ongoing:0.0, planned:0.0, error:0.0}, e IN collect(e) |					
CASE					
	WHEN 	e.Completed = "true"  AND e.eventCompletedDate <> "" AND (date(e.eventCompletedDate)  <= (date()+Duration({days: 1}))) AND duration.inDays(date(e.eventStartDate), date(e.eventCompletedDate)).days >= 0			
		THEN 	{completed:s.completed+1, overdue:s.overdue, ongoing:s.ongoing, planned:s.planned, error:s.error}		
		ELSE 			
			CASE WHEN	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) <= date())	
			THEN 	{completed:s.completed, overdue:s.overdue+1, ongoing:s.ongoing, planned:s.planned, error:s.error}	
			ELSE 		
				CASE WHEN 	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) > date()) AND (date(e.eventStartDate) <= date())
				THEN 	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing+1, planned:s.planned, error:s.error}
                ELSE
                    CASE WHEN 	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) > date()) AND (date(e.eventStartDate) > date())
                    THEN 	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing, planned:s.planned+1, error:s.error}
                    ELSE	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing, planned:s.planned, error:s.error+1}
                    END
                END	
			END		
		END) AS status	
return c.caseID as caseID,status.completed as completed,status.overdue as overdue,status.ongoing as ongoing,status.planned as planned,status.error as error,toFloat(total) as total,c.phsVolunteer as editor
${orderbycypher}	
skip ${10*page}
limit 10			
`
//console.log(q)
    session.run(q)
      .then(result => {
        session.close();
        //console.log(result.records)
        DBlist = []
        
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
              //console.log(record.length)
              //console.log(record._fields[i])
            }
            //add post-process here -e.g. if it is an integer we can process it here
            
            DBlist.push(tmp)
            
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        console.log(error);
        error["error"] = 1;
        res.send(error)
      })
})

router.post(`/getcases/summary/:Page/:Order/:User`, (req, res)=>{
    
    //console.log('/api/v1/getcases link works')
   if(!"q" in req.body || !req.params.User){
      res.send({error:1}); return;
    }
    
    let page = req.params.Page;
    page = Number(page);
    if (isNaN(page)){
      res.json({error:1});
      return;
    }
    
    let orderbycypher = "order by total desc";
    console.log(req.body)
    //if ('order' in req.body){
      //let orderby = req.body['order'];
      let orderby = req.params.Order;
      if (orderby){
        orderbycypher = `order by ${orderby} desc`;
      }
    
    const session = driver.session()
    q = `
CALL db.index.fulltext.queryNodes('case', 'caseID:${req.body.q}') 
YIELD node as c
WHERE COALESCE(c.hidden, 0) <> 1 AND c.phsVolunteer = "${req.params.User}"
optional match (c)-[:HAS]->(e:Event)	
with distinct c, count(e) as total,					
REDUCE(s = {completed:0.0, overdue:0.0, ongoing:0.0, planned:0.0, error:0.0}, e IN collect(e) |					
CASE					
	WHEN 	e.Completed = "true"  AND e.eventCompletedDate <> "" AND (date(e.eventCompletedDate)  <= date()) AND duration.inDays(date(e.eventStartDate), date(e.eventCompletedDate)).days >= 0			
		THEN 	{completed:s.completed+1, overdue:s.overdue, ongoing:s.ongoing, planned:s.planned, error:s.error}		
		ELSE 			
			CASE WHEN	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) <= date())	
			THEN 	{completed:s.completed, overdue:s.overdue+1, ongoing:s.ongoing, planned:s.planned, error:s.error}	
			ELSE 		
				CASE WHEN 	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) > date()) AND (date(e.eventStartDate) <= date())
				THEN 	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing+1, planned:s.planned, error:s.error}
                ELSE
                    CASE WHEN 	e.eventStartDate <> "" AND e.eventDueDate <> "" AND e.Completed <> "true" AND (date(e.eventDueDate) > date()) AND (date(e.eventStartDate) > date())
                    THEN 	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing, planned:s.planned+1, error:s.error}
                    ELSE	{completed:s.completed, overdue:s.overdue, ongoing:s.ongoing, planned:s.planned, error:s.error+1}
                    END
                END	
			END		
		END) AS status	
return c.caseID as caseID,status.completed as completed,status.overdue as overdue,status.ongoing as ongoing,status.planned as planned,status.error as error,toFloat(total) as total
${orderbycypher}	
skip ${10*page}
limit 10			
	
`
//console.log(q)
    session.run(q)
      .then(result => {
        session.close();
        //console.log(result.records)
        DBlist = []
        
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
              //console.log(record.length)
              //console.log(record._fields[i])
            }
            //add post-process here -e.g. if it is an integer we can process it here
            
            DBlist.push(tmp)
            
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        console.log(error);
        error["error"] = 1;
        res.send(error)
      })
})



//get 
router.get(`/metrics/overlap`, (req, res)=>{
  const session = driver.session()
   session.run(`
 MATCH (n:Case) 
 //WHERE COALESCE(n.hidden, 0) <> 1 
 RETURN toFloat(count(n))
 
   `)
      .then(result => {
        session.close();
        res.json(result.records)
        
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


//post
//add a new Event to a Case by caseID, also add a NEXT relation from eventID 
router.post(`/addevent/:caseID/:eventID`, (req, res)=>{
    
    var caseID = req.params.caseID; // properties 
    var prevEventID = req.params.eventID; //node id
    var param = process_json_n4j(req.body);

/*
    q = `
MATCH (a) where a.caseID = '20006'
MATCH (c:Event) where ID(c) = 555
CREATE (b:Event 
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
    
    //var caseID = req.params.caseID;
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

router.post(`/assign/:caseID`, (req, res)=>{
    var role = parseQuery(req.query.role); //check role to proceed
    if (role != "ADMIN"){
        res.json({status: 0, message: 'user role does not allow this action'})
        return;
    }
    if (!req.params.caseID){
        res.json({status: 0, message: 'missing caseID'})
        return;
    }
    /*
    if (!req.body.editor){
        res.json({status: 0, message: 'missing params'})
        return;
    }*/
    q = `
MATCH (c:Case {caseID: "${req.params.caseID}"})
SET c.phsVolunteer = "${req.body.editor}"
RETURN c;
`;

    const session = driver.session()
    session.run(q) 
    .then(result => {
        session.close();
        console.log(result);
        res.json(result);
    })
    .catch(error => {
      session.close();
      res.send(error)
    })
    
})

//post
router.post(`/createcase`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    console.log(req.query)
    
    //var newCase = JSON.parse(JSON.stringify(req.body))
    var user = parseQuery(req.query.user); //adds the username as Case.phsVolunteer
    // and req.query.role
    
    var newCase = JSON.stringify(req.body)
    var newCase = newCase.replace(/"([^"]+)":/g, '$1:');
    console.log(newCase)
    q1 = "MATCH (p:Case {caseID: '"+req.body['caseID']+"'}) return count(p) as len"
    q2 = `
CREATE (n:Case ${newCase}) 
SET n.phsVolunteer = "${user}"
return n
    `
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
               res.json({status: 1, message: 'new case added', data: req.body['caseID']})
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


//get case event
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



//get case event V2
/*
with the new structure where all Events are linked to a Case
Case-[:HAS]-> Event
Event-[:NEXT]-> Event

we can run a simple cyhper query like this

MATCH (a {caseID:"20000"})-[:HAS]->(b)-[r:NEXT]->() RETURN COLLECT(DISTINCT b) as nodes ,COLLECT(DISTINCT r) as edges

*/

router.get(`/getcaseeventV2/:caseID`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.params)
    
    var caseID = req.params.caseID;
    
    const session = driver.session()
    /*
    q = `
MATCH (a {caseID:"${caseID}"})-[:HAS]->(b)-[r:NEXT]->() 
RETURN COLLECT(DISTINCT b) as nodes ,COLLECT(DISTINCT r) as edges
`
*/
q = `
MATCH (a {caseID:"${caseID}"})-[r2:HAS]->(b)
OPTIONAL MATCH (b)-[r:NEXT]->() 
RETURN COLLECT(DISTINCT b) as nodes ,COLLECT(DISTINCT r) as edges
`

    //console.log(q)
    session.run(q) 
      .then(result => {
        //console.log(result)
        session.close();
        
        var nodes = result.records[0]._fields[0];
        var edges = result.records[0]._fields[1];
        
        //convert identity to id - todo: needs tidy up
        for (var i in nodes){
            nodes[i].id = toNumber(nodes[i].identity)
            delete nodes[i].identity
        }
        for (var i in edges){
            edges[i].id = toNumber(edges[i].identity)
            delete edges[i].identity
            edges[i].startNodeId = toNumber(edges[i].start)
            edges[i].endNodeId = toNumber(edges[i].end)
        }
        
        res.send({nodes:nodes,edges:edges});
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

//delete Event
router.delete(`/event/:eventID`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.params)
    var eventID = Number(req.params.eventID);
    
    const session = driver.session()
    
    //DETACH DELETE n
    q = `MATCH (n:Event) 
    WHERE ID(n) = ${eventID} 
    WITH n, properties(n) AS m  
    DETACH DELETE n
    RETURN m`
    
    //todo: change this to return the relations and the node properties itself, say to file
    
    console.log(q)
    session.run(q) 
      .then(result => {
        //console.log(result)
        session.close();
        //res.json(result.records)
        //res.json(result.records[0]._fields[0].properties)
        res.json(result.records)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})

//"delete" Case - "mark the case as hidden"
router.delete(`/case/:caseID`, (req, res)=>{
    //console.log('/api/v1/getcases link works')
    //var newCase = JSON.parse(JSON.stringify(req.body))
    var param = req.body;
    delete param['caseID']
    
    var caseID = req.params.caseID; //note: if the caseID does not exist, no changes in n4j

    q = `MATCH (n) WHERE n.caseID = "${caseID}" SET n.hidden = 1`;
    console.log(q)
    
    const session = driver.session()
    session.run(q) 
    .then(result => {
        session.close();
        res.json({status: 1, message: `Deleted case record: ${caseID}`})
    })
    .catch(error => {
      session.close();
      error["status"] = 0;
      res.send(error)
    })
    
})

//temporary - needs review - create Event->Event relation    
router.get(`/eventevent/:eventID1/:eventID2`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    //console.log(req.params)
    //console.log(req.body)
    var sourceID = req.params.eventID1;
    var targetID = req.params.eventID2;

    /*
    test
    MATCH (a)-[r1:HAS]-(b)-[r2:NEXT]-(c) where a.caseID = 'templateA' AND b.Label = "Connection Installed" return b,c;
    */
    const session = driver.session()
    q = `
MATCH (a) WHERE ID(a) = ${sourceID}
MATCH (b) WHERE ID(b) = ${targetID}
MERGE (a)-[r:NEXT]->(b)
return r;
    `
    
    //`MATCH (n:Case {caseID:'${req.params.caseID}'}) RETURN n`
    console.log(q)
    
    session.run(q) 
      .then(result => {

        console.log(result.records)
        session.close();
        //res.json(result.records)
        

        res.json(result.records)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})

//testing reporting procedures

router.get(`/eventplot`, (req, res)=>{

    const session = driver.session()
    q = `
match (e:Event)
where e.eventCompletedDate <> "" AND e.Completed = "true"
with e,duration.inDays(date(e.eventStartDate), date(e.eventCompletedDate)).days as days
where days > 0
with distinct e.Label as key, percentileCont(days, 0.25) as q1, percentileCont(days, 0.5) as median, percentileCont(days, 0.75) as q3, min(days) as min, max(days) as max,count(days) as count
with key, {q1: toFloat(q1),median:toFloat(median),q3:toFloat(q3),min:toFloat(min),max:toFloat(max),count:toFloat(count)} as value, median
return {key:key, value:value}
order by median desc
    `

    //`MATCH (n:Case {caseID:'${req.params.caseID}'}) RETURN n`
    console.log(q)
    
    session.run(q) 
      .then(result => {

        console.log(result.records)
        session.close();
        //res.json(result.records)
        
        output = []
        
        for (var i in result.records){
          output.push(result.records[i]._fields[0])
        }
        
        
        res.json(output)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})


//temporary - needs review  - delete Event->Event relation    
router.delete(`/eventevent/:eventID1/:eventID2`, (req, res)=>{
    //console.log('/api/v1/getcase/:case link works')
    //console.log(req.params)
    //console.log(req.body)
    var sourceID = req.params.eventID1;
    var targetID = req.params.eventID2;

    /*
    test
    MATCH (a)-[r1:HAS]-(b)-[r2:NEXT]-(c) where a.caseID = 'templateA' AND b.Label = "Connection Installed" return b,c;
    */
    const session = driver.session()
    q = `
MATCH (a) WHERE ID(a) = ${sourceID}
MATCH (b) WHERE ID(b) = ${targetID}
MATCH (a)-[r:NEXT]->(b)
DELETE r
    `
    
    //`MATCH (n:Case {caseID:'${req.params.caseID}'}) RETURN n`
    console.log(q)
    
    session.run(q) 
      .then(result => {

        console.log(result.records)
        session.close();
        //res.json(result.records)
        

        res.json(result.records)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})

// import and export procedures for migration between neo4j-db
//admin only procedure


router.get(`/exportjson/:caseID`, (req, res)=>{
    const session = driver.session()
    let caseID = req.params.caseID;
    if (!caseID){
      res.send({status:0})
      return;
    }
    
q = `
MATCH (c:Case {caseID:"${caseID}"})
//MATCH (c:Case)
optional match (c)-[r1:HAS]->(e:Event)
optional match (e:Event)-[r2:NEXT]->(:Event)
return distinct c as case,collect(e) as event,collect(r1) as has,collect(r2) as next
//limit 2
`;

    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
        
        
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})


router.get(`/compareall/:caseID`, (req, res)=>{
    const session = driver.session()
    let caseID = req.params.caseID;
    if (!caseID){
      res.send({status:0})
      return;
    }
    
q = `
CALL {	
	MATCH (a:Case)-[:HAS]->(b:Event)
	WHERE NOT (:Event)-[:NEXT]->(b)
	AND NOT a.caseID STARTS WITH "template"
	
	CALL apoc.path.subgraphNodes(b, {relationshipFilter: "NEXT>", minLevel: 0, maxLevel: 100 })
	yield node
	with distinct a as case, collect(node.Label) as labels
	
	return distinct case.caseID as B, labels
	
}	
CALL {	
	MATCH (a:Case)-[:HAS]->(b:Event)
	WHERE NOT (:Event)-[:NEXT]->(b)
	AND a.caseID = "${req.params.caseID}"
	
	CALL apoc.path.subgraphNodes(b, {relationshipFilter: "NEXT>", minLevel: 0, maxLevel: 100 })
	yield node
	with distinct a as case, collect(node.Label) as labels
	
	return distinct case.caseID as A, labels as sourceLabels
	
}	
	
RETURN B as caseID, toFloat(size([n IN sourceLabels WHERE n IN labels])) as overlap , toFloat(eric.editdistance(sourceLabels,labels)) AS editdistance, toFloat(size(sourceLabels)) as max	
order by editdistance	
`;

    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
        
        
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})

//find potentials Event nodes that can be forward (startdate later than Evt) /backward (startdate earlier than Evt) dependent on an Event but not already linked

router.get(`/event/:eventID/pforward`, (req, res)=>{
    const session = driver.session()
    let eventID = req.params.eventID;
    if (!eventID){
      res.send({status:0})
      return;
    }
q = `
match (c:Case)-[:HAS]->(e:Event)-[:NEXT]->(e2:Event)
where ID(e) = ${eventID}
with c, e, collect(e2) as e2
match (c)-[:HAS]->(event:Event)
where event <> e AND NOT event IN e2 AND date(event.eventStartDate) >= date(e.eventStartDate)
return distinct event
`;
    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})

router.get(`/event/:eventID/pbackward`, (req, res)=>{
    const session = driver.session()
    let eventID = req.params.eventID;
    if (!eventID){
      res.send({status:0})
      return;
    }
q = `
match (c:Case)-[:HAS]->(e:Event)<-[:NEXT]-(e2:Event)
where ID(e) = ${eventID}
with c, e, collect(e2) as e2
match (c)-[:HAS]->(event:Event)
where event <> e AND NOT event IN e2 AND date(event.eventStartDate) < date(e.eventStartDate)
return distinct event
`;
    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})

//find Event nodes that are dependent on an Event
router.get(`/event/:eventID/forward`, (req, res)=>{
    const session = driver.session()
    let eventID = req.params.eventID;
    if (!eventID){
      res.send({status:0})
      return;
    }
q = `
match (e:Event)-[:NEXT]->(event:Event)
where ID(e) = ${eventID}
return distinct event
`;

    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})



router.get(`/event/:eventID/backward`, (req, res)=>{
    const session = driver.session()
    let eventID = req.params.eventID;
    if (!eventID){
      res.send({status:0})
      return;
    }
q = `
match (event:Event)-[:NEXT]->(e:Event)
where ID(e) = ${eventID}
return distinct event
`;

    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})


//TODO
router.post(`/importjson/`, (req, res)=>{
    const session = driver.session()

    //process the json list[{case:{},event:[],next:[]}]
    /*
    check if the caseID already exists in the db
    add case
    
    
    */
    
    
    if (!true){
      res.send({status:0})
      return;
    }
    
q = `

`;

    session.run(q) 
      .then(result => {
        session.close();
        //res.json(result.records)
        DBlist = []
        //return records as List[{key:values,key:values}] where key is the name of variable from query
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            let tmp ={}
            for (var i =0; i < record.length; i++){
              tmp[record.keys[i]] = record._fields[i]
            }
            //add post-process here -e.g. if it is an integer we can process it here  
            DBlist.push(tmp)
        })
        //res.json(result.records)
        res.json(DBlist)
        
        
      })
      .catch(error => {
        session.close();
        error["status"] = 0;
        res.send(error)
      })
})


//utility to get the last item from multiple inputs in querystring or the item where there is only one
function parseQuery(data){
    //here we need to look for the last item if it is an array
    //req.query.user and req.query.role
    if (Array.isArray(data)){
        if (data.length > 0){
            data = data.pop();
        }else{
            data = "";
        }
    }
    return data;
}

//test to see what we can get from the user system to avoid sending things through on the client side
router.get(`/testbody`, (req, res)=>{
    
    /*
    {
        "user": [
            "urlquery",
            "demoadmin"
        ],
        "role": "ADMIN"
    }
    */
    
    res.json(req.query)

})


module.exports = router;

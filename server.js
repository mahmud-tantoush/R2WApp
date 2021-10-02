const express = require('express');
const path = require('path');
const driver = require('./driver.js');
let cors = require('cors');
const fs = require('fs');

/*
/////// EC dev only
const https = require('https');
// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/eric.myvnc.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/eric.myvnc.com/fullchain.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/eric.myvnc.com/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
*/


require('dotenv').config();

//ref for neo4j + node : https://github.com/neo4j-examples/neo4j-movies-template

//docker-compose up to run database

// load placeholder data

// docker build -t r2wfrontend . to build image
// docker run  docker run -dp 5000:5000 r2wfrontend to run container

const server = express()

server.use(express.json());


server.use(express.static(path.join(__dirname, 'public')))

server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

server.use(cors())

const cases_api = require('./routes/cases');

server.use('/api/v1/cases', cases_api);

server.get('/', (req, res)=>{
  //res.json(products) //serves raw Json and seeds to endpoint
  res.send('<h1>Home page </h1><a href="/api/products" >Products</a>')
})

///////////// view template
server.set('view engine', 'ejs')



server.get(`/index2`, (req, res) => {
  res.render("index", { user: req.query }); //under views/index.ejs
});

server.get(`/overview`, (req, res) => {
  res.render("overview", { user: req.query }); //under views/overview.ejs
});

server.get(`/view/case/:caseID`, (req, res)=> {
    if (req.query.role == 'ADMIN') //note: passing query string means that it can be inserted by user in the url bar, use with caution
    { 
    
      //load some presets from json files
      let EventLabels = fs.readFileSync('./presets/EventLabels.json');
    
      res.render("case_admin", { 
                                    'user': req.query.user,'role': req.query.role,
                                    caseID: req.params.caseID , 
                                    EventLabels:JSON.parse(EventLabels)
                               }); //under views/case_admin.ejs
    }
    else if (req.query.role == 'EDITOR')
    {
      //check db to see if the Case with caseID:req.params.caseID mathces with the editor name
    
        let session = driver.session()
        //eg quey search param: http://localhost:5050/api/v1/getnodes?node=Case&limit=5
        q = `MATCH (c:Case {caseID:"${req.params.caseID}",phsVolunteer:"${req.query.user}"}) RETURN toFloat(count(c))`
        console.log(q)
        session.run(q) 
        .then(result => {
          //console.log(result)
          session.close();
          
          if (result.records[0]._fields[0] == 0){
              //view only
              //res.send({"todo":"view only"})
              
              res.render("case_viewer", {  'user': req.query.user,'role': req.query.role, caseID: req.params.caseID }); //under views/case_editor.ejs
              
          }
          else{
          //load some presets from json files
          let EventLabels = fs.readFileSync('./presets/EventLabels.json');
          let Wards = fs.readFileSync('./presets/Wards.json');

          //console.log(JSON.stringify(JSON.parse(rawdata)))
          res.render("case_editor", { 
                                        'user': req.query.user,'role': req.query.role,
                                        caseID: req.params.caseID, 
                                        EventLabels:JSON.parse(EventLabels),
                                        Wards:JSON.parse(Wards)
                                    }); //under views/case_editor.ejs
          }
        })
        .catch(error => {
          session.close();
          res.send(error)
        })
        

              
                                  
    }
    else{ 
      res.send("Please login to proceed");
      //res.render("case_admin", { caseID: req.params.caseID }); //under views/case_admin.ejs
    }
    //res.render('case', { 'caseID' : req.params.caseID }) //under views/case.ejs
})

server.get(`/index`, (req, res)=> {
    if (req.query.role == 'ADMIN')
    { 
      res.render("user_admin",  { 'user': req.query.user,'role': req.query.role }); //under views/case_admin.ejs
    }
    else if (req.query.role == 'EDITOR')
    {
      res.render("user_editor", { 'user': req.query.user,'role': req.query.role }); //under views/case_editor.ejs
    }
    else{
      res.send("Please login to proceed");
    }
    //res.render('case', { 'caseID' : req.params.caseID }) //under views/case.ejs
})

server.get(`/dev`, (req, res) => {
  if (req.query.role == 'ADMIN')
  { 
    res.render("dev", {  }); //under views/overview.ejs
  }
  else{
    res.send("admin only");
  }
});


//not used
/*
server.get(`/view/event/:eventID`, (req, res)=> {
    res.render('event', { 'eventID' : req.params.eventID }) //under views/event.ejs
})
server.get(`/view/:caseID/:eventID`, (req, res)=> {
    res.render('case-event', { 'caseID' : req.params.caseID, 'eventID' : req.params.eventID }) //under views/event.ejs
})
*/

///////////// view template

// get 
server.get(`/sayhi`, (req, res)=>{
  res.status(200).json(driver)
  console.log('hi')
})

// API not working
//load data into server
server.get('/loaddata', (req, res) =>  {
  let session = driver.session()
  let q = `CALL apoc.help('text')`
  //`call apoc.import.graphml('R2W.graphml', {useTypes: true, readLabels: true})`
  console.log(q)
  session.run(q) 
  .then(() => {
    console.log('got to line 107 in server.js')
    //console.log(result)
    session.close();
    res.json({templateDataLoadedSucess: true})
  })
  .catch(error => {
    session.close();
    res.json(error)
    console.log(error)
  })
});


//query end point
// pass query with spaces encoded as %20
server.get(`/api/v1/query/:querystring`, (req, res)=>{
  //console.log('/api/v1/getcase/:case link works')
  console.log(req.params)
  let session = driver.session()
  q = `${req.params.querystring}`
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

//search query endpoint
server.get(`/api/v1/getnodes`, (req, res)=>{
  //console.log('/api/v1/getcase/:case link works')
  //console.log(req.query)
  const {node, limit} = req.query
  let session = driver.session()
  //eg quey search param: http://localhost:5050/api/v1/getnodes?node=Case&limit=5
  q = `MATCH (n:${node}) RETURN n LIMIT ${limit} `
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

// all other api endpoints
server.all('*', (req, res)=>{
  res.status(404).send('No such API exisits - MT!')
})

const port = process.env.PORT

console.log(port)

server.listen(port, () => console.log(`listening on port ${port}...`))
//methods: app.[get post put delete all use listen]

/*
/// SSL support
const httpsServer = https.createServer(credentials, server);
httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
*/


// run docker with updated files:
//   docker-compose build --no-cache
// docker-compose up -d

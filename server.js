const express = require("express");
const path = require("path");
const driver = require("./driver.js");
let cors = require("cors");

require("dotenv").config();

//ref for neo4j + node : https://github.com/neo4j-examples/neo4j-movies-template

//docker-compose up to run database

// load placeholder data

// docker build -t r2wfrontend . to build image
// docker run  docker run -dp 5000:5000 r2wfrontend to run container

const server = express();

const serverInitialize = async () => {
  server.use((_, __, next) => {
    console.log("received request");
    next();
  });

  server.use(express.static(path.join(".", "public")));

  //middleware example
  // server.use(function (req, res, next) {
  //     res.header('Access-Control-Allow-Origin', '*');
  //     res.header(
  //         'Access-Control-Allow-Headers',
  //         'Origin, X-Requested-With, Content-Type, Accept'
  //     );
  //     next();
  // });

  server.use(cors());
  server.use(express.json());

  const cases_api = require("./routes/cases");
  server.use("/api/v1/cases", cases_api);

  const events_api = require("./routes/events");
  server.use("/api/v1/events", events_api);

  ///////////// view template: npm install ejs
  server.set("view engine", "ejs");

  ////////////
  // cannot pass req parameters through proxy, decode the cookie instead?
  /*
  const jwt = require('jsonwebtoken');
  const cookieParser = require('cookie-parser');
  server.use(cookieParser());
  const { SECRET, NEW_USER_KEY, CLIENT_KEY } = require('./auth/config');
  */
  ////////////

  server.get(`/index`, (req, res) => {
    res.render("index", { user: req.query }); //under views/index.ejs
  });

  server.get(`/overview`, (req, res) => {
    res.render("overview", { user: req.query }); //under views/overview.ejs
  });


  server.get(`/view/case/:caseID`, (req, res) => {
  
    //add auth info here redirect to different views
    console.log("view/case");
    
    
    ////////////////////////////////////////////////////////////
    /////////////// OPTION 1 with querystring passed on from proxy
    console.log(req.query);
    
    ////////////////////////////////////////////////////////////
    /////////////// OPTION 2 decode the jwt token, need same SECRET as login
    /*
    const { token } = req.cookies;
    
    if (token){
      const decoded = jwt.verify(token, SECRET);
      console.log(decoded)
      if (decoded.group == "ADMIN"){
        res.render("case", { caseID: req.params.caseID }); //under views/case.ejs
      }
      if (decoded.group == "EDITOR"){
        res.render("case_editor", { caseID: req.params.caseID }); //under views/case.ejs
      }
      //res.render("test", { req: decoded }); //under views/case.ejs
    }
    */
    ////////////////////////////////////////////////////////////
    if (req.query.role == 'ADMIN') //note: passing query string means that it can be override by user, use with caution
    { 
      
      res.render("case_admin", { caseID: req.params.caseID }); //under views/case_admin.ejs
    }
    else if (req.query.role == 'EDITOR')
    {
     res.render("case_editor", { caseID: req.params.caseID }); //under views/case_editor.ejs
    }
    else{
      res.send("Please login to proceed");
    }
  });
  
  //not used
  server.get(`/view/event/:eventID`, (req, res) => {
    res.render("event", { eventID: req.params.eventID }); //under views/event.ejs
  });
  
  
  ///////////// view template end

  // // API not working - design to load temaplte data
  // //load data into server
  // server.get('/loaddata', (req, res) =>  {
  //   let session = driver.session()
  //   let q = `CALL apoc.help('text')`
  //   //load temaplte data
  //   //`call apoc.import.graphml('R2W.graphml', {useTypes: true, readLabels: true})`
  //   console.log(q)
  //   session.run(q)
  //   .then(() => {
  //     session.close();
  //     res.json({templateDataLoadedSucess: true})
  //   })
  //   .catch(error => {
  //     session.close();
  //     res.json(error)
  //     console.log(error)
  //   })
  // });

  //query end point
  // pass query with spaces encoded as %20
  // server.get(`/api/v1/query/:querystring`, (req, res)=>{
  //   //console.log('/api/v1/getcase/:case link works')
  //   console.log(req.params)
  //   let session = driver.session()
  //   q = `${req.params.querystring}`
  //   console.log(q)
  //   session.run(q)
  //     .then(result => {
  //       //console.log(result)
  //       session.close();
  //       res.json(result.records)
  //     })
  //     .catch(error => {
  //       session.close();
  //       res.send(error)
  //     })
  // })

  //example: http://localhost:5050/api/v1/query/querystring?query=Match (n) return n limit 10
  server.get(`/api/v1/query/querystring`, (req, res) => {
    //console.log('/api/v1/getcase/:case link works')
    console.log(req.query);
    const query = req.query.query;
    let session = driver.session();
    q = query;
    console.log(q);
    session
      .run(q)
      .then((result) => {
        session.close();
        res.json(result.records);
      })
      .catch((error) => {
        session.close();
        res.send(error);
      });
  });

  //search query endpoint
  server.get(`/api/v1/getnodes`, (req, res) => {
    //console.log('/api/v1/getcase/:case link works')
    //console.log(req.query)
    const { node, limit } = req.query;
    let session = driver.session();
    //eg quey search param: http://localhost:5050/api/v1/getnodes?node=Case&limit=5
    q = `MATCH (n:${node}) RETURN n LIMIT ${limit} `;
    console.log(q);
    session
      .run(q)
      .then((result) => {
        //console.log(result)
        session.close();
        res.json(result.records);
      })
      .catch((error) => {
        session.close();
        res.send(error);
      });
  });

  // all other api endpoints
  server.all("*", (req, res) => {
    res.status(404).send("No such API exists");
  });

  //methods: app.[get post put delete all use listen]

  // run docker with updated files:
  //   docker-compose build --no-cache
  // docker-compose up -d
  return server;
};

module.exports = serverInitialize;

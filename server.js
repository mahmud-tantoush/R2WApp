const express = require('express');
const path = require('path');
const driver = require('./driver.js');
let cors = require('cors');

require('dotenv').config();

//ref for neo4j + node : https://github.com/neo4j-examples/neo4j-movies-template

//docker-compose up to run database

// load placeholder data

// docker build -t r2wfrontend . to build image
// docker run  docker run -dp 5000:5000 r2wfrontend to run container

const server = express()

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
server.use(express.json());

const cases_api = require('./routes/cases');

server.use('/api/v1/cases', cases_api);

server.get('/', (req, res)=>{
  //res.json(products) //serves raw Json and seeds to endpoint
  res.send('<h1>Home page </h1><a href="/api/products" >Products</a>')
})

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
  res.status(404).send('No such API exisits')
})

const port = process.env.PORT

console.log(port)

server.listen(port, () => console.log(`listening on port ${port}...`))
//methods: app.[get post put delete all use listen]


// run docker with updated files:
//   docker-compose build --no-cache
// docker-compose up -d

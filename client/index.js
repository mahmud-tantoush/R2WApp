var viz;

var DBlist = []

var session = driver.session();

//get properties for each case in db     var=DBlist
session
    .run(`Match (n:Case) return n`)
    .then((result) => {
        //console.log(result.records[0]._fields[0])
        session.close()
        DBlist = []
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            DBlist.push(record._fields[0])
        })
    })
    .then(() => {
        //console.log(DBlist)
        renderListings(DBlist)
    })
    .catch(e => {
        session.close();
        throw e
    });


function draw(query) {  //takes in a query
    var config = {
        container_id: "viz",
        server_url: "bolt://localhost:7687",
        server_user: "neo4j",
        server_password: "R2W",
        labels: {
            'Case': {
                'caption': 'caseID',
                "size": 5.0 ,
                'color':'black'
            },
            'Action': {
                'caption': true,
                "size": 5.0,
                'colour': '#ffffff'
            },
            'Contact': {
                'caption': 'type',
                "size": 5.0,
                'colour': '#ffffff'
            },
            'PHSvolunteer': {
                'caption': 'type',
                "size": 5.0,
                'colour': '#ffffff'
            }
        },
        relationships: {
        },
        hierarchical_sort_method: 'directed',
        arrows:true,
        initial_cypher: query
    };

    console.log(query)

    viz = new NeoVis.default(config);
    viz.render();
}

var listingEl = document.getElementById('feature-listing');
var filterEl = document.getElementById('feature-filter');

filterEl.addEventListener('keyup', function(e) {
    var value = normalize(e.target.value);
    //console.log(value)

    filtered = DBlist.filter(function(item) {
        //console.log(a)
        potentialCaseID = item.properties.caseID.toString();
        //  var add other searc parametes
        console.log(potentialCaseID.indexOf(value) > -1)
        return potentialCaseID.indexOf(value) > -1 // add || for other parms here
        });

    //console.log(filtered)
    renderListings(filtered)
    });

function renderListings(items) {
    listingEl.innerHTML = ''; //reset html

    // add search all item
    var getAll = document.createElement('a') 
    getAll.addEventListener('click', function() {
        console.log('clicked')
        draw('MATCH (n), (a)-[r]-(b) RETURN a, r, b, n')
    });
    getAll.className = 'sideBarListElements'
    getAll.id = 'caseID'
    getAll.style = 'background-color: rgb(240, 240, 240);color:black'
    getAll.textContent = 'GET ALL GRAPHS'
    listingEl.appendChild(getAll);

    console.log(items)
        if (items.length) {
            items.forEach(function(item) {
                var prop = item.properties;
                //console.log(prop)
                var i = document.createElement('a');
                //console.log(i)
                i.className = 'sideBarListElements'
                i.textContent = prop.caseID
                i.id = 'caseID'
                i.addEventListener('click', function() {
                    console.log('clicked')
                    draw(
                    `MATCH (p:Case {caseID: ${prop.caseID}})
                    CALL apoc.path.subgraphAll(p, {
                        minLevel: 0,
                        maxLevel: 10
                    })
                    YIELD nodes, relationships
                    RETURN nodes, relationships, p`)
                });

                listingEl.appendChild(i);
            // Show the filter input
            filterEl.parentNode.style.display = 'block';
            })
        }
}

function normalize(string) {
    return string.trim().toLowerCase();
    }

/*
//var initList = [{"id": 0,"properties": {"location": '',"caseID": {"low": null,"high": 0}}}]

//renderListings(initList) //init side bar command, then call wth data from db in session

function getData(url){
    var d
    fetch('http://localhost:5050/api/cases/getAll')
        .then(res => res.json())
        .then(data => d = data)
        .then(() => {console.log(d)})
}
}
    console.log(listingEl)

     function renderList(items){
      

      var empty = document.createElement('p');
      listingEl.innerHTML = '';
      if (items.length) {
        items.forEach(function(item) {
          var i = document.createElement('a');
          i.textContent = toString(item)
          listingEl.appendChild(i);
        })
      };
    };
    //renderList(list)

    */
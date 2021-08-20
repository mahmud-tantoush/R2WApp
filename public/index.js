var viz;

var DBlist = []

fetch('./api/v1/cases/getcases')
.then((res)=> {
    res.json().then(data => renderListings(data))
})
.catch((err)=> console.log(err))

// var session = driver.session();
// //get properties for each case in db     var=DBlists
// session
//     .run(`Match (n:Case) return n`)
//     .then((result) => {
//         //console.log(result.records[0]._fields[0])
//         session.close()
//         DBlist = []
//         result.records.forEach(function(record){
//             //console.log(record._fields[0])
//             DBlist.push(record._fields[0])
//         })
//     })
//     .then(() => {
//         //console.log(DBlist)
//         renderListings(DBlist)
//     })
//     .catch(e => {
//         session.close();
//         throw e
//     });

function draw(query) {  //takes in a query
    var config = {
        container_id: "viz",
        server_url: dbLoc,
        server_user: dbUsername,
        server_password: dbPassword,
        labels: { 
            'Case': {
                'caption': 'Location',
            } ,
            'Event': {
                'caption': 'Label',
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
        potentialCaseID = item.properties.caseID;
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
        //console.log('clicked')
        draw('MATCH (n:Case) RETURN n') //
    });
    getAll.className = 'sideBarListElements'
    getAll.id = 'caseID'
    getAll.style = 'background-color: rgb(240, 240, 240);color:black'
    getAll.textContent = 'View All Cases'
    listingEl.appendChild(getAll);

    //console.log(items)
        if (items.length) {
            items.forEach(function(item) {
                //console.log(item.properties.caseID.low)
                var i = document.createElement('a');
                i.className = 'sideBarListElements'
                i.textContent = item.properties.caseID
                i.id = 'caseID'
                i.addEventListener('click', function() {
                    //console.log('clicked')
                    QString = `MATCH (p:Case {caseID: "${item.properties.caseID}"}) 
CALL apoc.path.subgraphAll(p, {relationshipFilter: ">", minLevel: 0, maxLevel: 100 })
YIELD nodes, relationships
RETURN nodes, relationships, p`
                    draw(QString)
                    //console.log(QString)
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
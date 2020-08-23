var viz;

var DBlist = []

var session = driver.session();

function normalize(string) {
    return string.trim().toLowerCase();
    }

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

var listingEl = document.getElementById('feature-listing');
var filterEl = document.getElementById('feature-filter');
var caseManagementForm = document.getElementById('caseManagement-form');

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

        document.getElementById('titleElement').innerText = 'Overview of cases'
    });

    getAll.className = 'sideBarListElements'
    getAll.id = 'caseID'
    getAll.style = 'background-color: rgb(240, 240, 240);color:black'
    getAll.textContent = 'View All Cases'
    listingEl.appendChild(getAll);

    console.log(items)
        if (items.length) {
            items.forEach(function(item) {
                // get current case ID

                var prop = item.properties;
                //console.log(prop)
                var i = document.createElement('a');
                //console.log(i)
                i.className = 'sideBarListElements'
                i.textContent = prop.caseID
                i.id = 'caseID'
                i.addEventListener('click', function() {

                    currentCaseID = prop.caseID
                    document.getElementById('titleElement').innerText = `Case: ${currentCaseID}`

                    var queryString = `Match (p:Case {caseID: "${currentCaseID}"})
                    CALL apoc.path.subgraphAll(p, {
                        relationshipFilter: ">",
                        minLevel: 1,
                        maxLevel: 1000
                    })
                    YIELD relationships 
                    Match (a:Event)-[r]->(b:Event) 
                    Where r in relationships and r.Expected_Duration< duration.inDays(date(a.eventStartDate),date(b.eventStartDate)).days 
                    return r as Action ,r.Expected_Duration as Expected, duration.inDays(date(a.eventStartDate),
                    date(b.eventStartDate)).days as Taken , a.Label as Node`
            
                    var session = driver.session();
                    session
                        .run(queryString)
                        .then((result) => {
                            //console.log(result.records[0]._fields[0])
                            session.close()
                            //console.log(result.records)

                            caseManagementForm.innerHTML = `<h2 id='titleElement'>Case: ${currentCaseID}</h2>`

                            result.records.forEach(function(record){

                                //DBlist.push(record._fields[0])
                                caseEventsInfo = document.createElement('p')
                                caseEventsInfo.id = `caseEventsInfo`

                                caseEventsInfo.innerHTML = `Event : ${record._fields[3]} <br>
                                                            Expected days    :   ${record._fields[1]}  <br>
                                                            Taken days   :   ${record._fields[2]}`

                                caseManagementForm.appendChild(caseEventsInfo)

                            })
                        })
                        .catch(e => {
                            session.close();
                            throw e
                        });
                });
                listingEl.appendChild(i);
            // Show the filter input
            filterEl.parentNode.style.display = 'block';
            })
        }
}

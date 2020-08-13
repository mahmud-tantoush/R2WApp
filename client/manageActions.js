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
var actionList = document.getElementById('actionList');


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

    console.log(items)
        if (items.length) {
            items.forEach(function(item) {
                var prop = item.properties;
                console.log(prop)
                var i = document.createElement('a');
                //console.log(i)
                i.className = 'sideBarListElements'
                i.textContent = prop.caseID
                i.id = 'caseID'
                i.addEventListener('click', function() {
                    actionList.innerHTML = ''

                    console.log (`MATCH (p:Case {caseID: ${prop.caseID}})
                    CALL apoc.path.subgraphNodes(p, {
                        labelFilter: "Action",
                        relationshipFilter: ">",
                        minLevel: 1,
                        maxLevel: 30
                    })
                    YIELD node
                    RETURN node`)
                    
                    var session = driver.session();

                    session
                        .run(`MATCH (p:Case {caseID: ${prop.caseID}})
                        CALL apoc.path.subgraphNodes(p, {
                            labelFilter: "Action",
                            relationshipFilter: ">",
                            minLevel: 1,
                            maxLevel: 30
                        })
                        YIELD node
                        RETURN node`)
                        .then((result) => {
                            //console.log(result.records[0]._fields[0])
                            session.close()
                            DBlist = []
                            result.records.forEach(function(record){
                                //console.log(record._fields[0])
                                //console.log(record._fields[0].properties)

                                
                                actionListEl = document.createElement('li')
                                actionListEl.id = `actionElement`

                                actionListEla = document.createElement('a')
                                actionListEla.textContent = `${record._fields[0].properties.type}`
                                actionListEl.appendChild(actionListEla)

                                actionListElProp = document.createElement('p')
                                actionListElProp.innerText = JSON.stringify(record._fields[0].properties)

                                actionListEl.appendChild(actionListElProp)
                                //console.log(actionListEl)
                                actionList.appendChild(actionListEl)
                            })
                        })
                        .catch(e => {
                            session.close();
                            throw e
                        });

                    //reveal list
                    document.getElementById('actionList').style = 'display:block'

                    // change CASEID title
                    document.getElementById('titleElement').innerText = `Actions within case ${prop.caseID}`

                });
                listingEl.appendChild(i);

            // Show the filter input
            filterEl.parentNode.style.display = 'block';
            })
        }
}

caseManagementForm.addEventListener('submit', (e) => {
    var caseID = document.getElementById('caseIDi')
    var applicant = document.getElementById('applicant')
    var loc = document.getElementById('location')
    var phsVolunteer = document.getElementById('PHSv')
    var notes = document.getElementById('notes')
    var errorElement = document.getElementById('error')

    //add input checks here

    e.preventDefault();
    var eMessages = []

    if(eMessages.length == 0){  //data format is good
        
        errorElement.innerText = ''
        
        var n = `{caseID: ${caseID.value}, \
        applicant: '${applicant.value}',\
        location: '${loc.value}',  \
        phsVolunteer: '${phsVolunteer.value}', \
        notes : '${notes.value}'}`

        console.log(n) 
        // run the create command in db
        var session = driver.session();
        session
        .run(`MATCH (n:Case {caseID: ${currentCaseID}})\
            set n = ${n}`)
        .then(() => {
            console.log(`MATCH (n:Case {caseID: ${caseID.value}}) set n = ${n}`)
            createCaseForm.innerHTML = "<h6><b>Case Updated, page is reloading</b></h6>"
            document.location.reload(true)
        })
        .catch(e => {
            console/log('error with query')
            session.close();
            throw e
        });
    }
})
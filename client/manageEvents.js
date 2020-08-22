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

    //console.log(items) log cases
        if (items.length) {
            items.forEach(function(item) {
                //console.log(item.properties)
                var i = document.createElement('a');
                //console.log(i)
                i.className = 'sideBarListElements'
                i.textContent = item.properties.caseID
                i.id = `caseID: ${item.properties.caseID}`
                i.addEventListener('click', function() {
                    document.getElementById('addEvent').style = 'display:block' //show add new event button

                    actionList.innerHTML = ''

                    qString = `MATCH (p:Case {caseID: '${item.properties.caseID}'})
                    CALL apoc.path.subgraphNodes(p, {
                        labelFilter: "Event",
                        relationshipFilter: ">",
                        minLevel: 1,
                        maxLevel: 30
                    })
                    YIELD node
                    RETURN node`

                    console.log (qString)

                    currentCaseID = item.properties.caseID //current case in use
                    
                    var session = driver.session();

                    session
                        .run(qString)
                        .then((result) => {
                            //console.log(result.records[0]._fields[0])
                            session.close()
                            currentEventsList = []
                            result.records.forEach(function(record){
                                //console.log(record._fields[0])
                                //console.log(record._fields[0].properties)
                                
                                actionListEl = document.createElement('li')
                                actionListEl.id = `actionElement`

                                actionListEla = document.createElement('a')
                                actionListEla.textContent = `${record._fields[0].properties.Label}`
                                actionListEl.appendChild(actionListEla)
                                actionListEla.addEventListener('click',()=>{ //add event button functions
                                    EditEventModal.style.display = "block";
                                })

                                currentEventsList.push(record._fields[0])

                                actionListElProp = document.createElement('p')
                                actionListElProp.innerText = JSON.stringify(record._fields[0].properties)
                                actionListElProp.style = 'display:block'
                                
                                //console.log(actionListEl)
                                actionList.appendChild(actionListEl)
                                actionList.appendChild(actionListElProp)

                            })
                        })
                        .catch(e => {
                            session.close();
                            throw e
                        });

                    //reveal list
                    document.getElementById('actionList').style = 'display:block'

                    // change CASEID title
                    document.getElementById('titleElement').innerText = `Events for case ${item.properties.caseID}`
                });
                listingEl.appendChild(i);

            // Show the filter input
            filterEl.parentNode.style.display = 'block';
            })
        }
}

var eventModal = document.getElementById("EventModal");
var editEventModal = document.getElementById("EditEventModal");
var addEventBtn = document.getElementById("addEvent");
var span = document.getElementsByClassName("close")[0];
var addEventForm = document.getElementById('addEventForm');
var modalTitle = document.getElementById('modalTitle');

addEventBtn.onclick = function() {
    eventModal.style.display = "block";
  }

span.onclick = function() {
    eventModal.style.display = "none"
  }  

var session = driver.session();
session
.run(`Match (n:EventType) return n`)
.then((result) => { //result equals all the types of events
    //console.log(result)
    session.close()
    //eventTypes = []
    result.records.forEach(function(record){
        //console.log(record._fields[0].properties)
        //eventTypes.push(record._fields[0].properties.Label)
        var eventTypeOption = document.createElement('option')
        eventTypeOption.textContent = record._fields[0].properties.Label
        document.getElementById('addEventType').appendChild(eventTypeOption)
    })
})
.catch(e => {
    session.close();
    throw e
});


addEventForm.addEventListener('submit', (e) => {
    var input1 = document.getElementById('addEventType')
    var input2 = document.getElementById('notes')
    var input3 = document.getElementById('DateEventCommenced')
    var input4 = new Date()

    //add input checks here
    e.preventDefault();      
    eventModal.style.display = "none";  
        
    var n = 
    `{Label: '${input1.value}', \
    Notes : '${input2.value}',\
    DateEventCommenced: '${input3.value}',\
    DateLogged: '${input4.toString()}'}\ `

    console.log(n) 
    // run the create command in db
    var session = driver.session();

    if (currentEventsList.length==0){
        qstring = `
        MATCH (a:Case {caseID: '${currentCaseID}'})\
        CREATE (a) -[r:NewAction]-> (b:Event ${n})`
        session
        .run(qstring)
        .then(() => {
            console.log(qstring)
            document.location.reload(true)
        })
        .catch(e => {
            console.log(qstring)
            console.log('error with query')
            session.close();
            throw e
        });
    } else {
        var latestEvent = currentEventsList[currentEventsList.length - 1]
        qstring = `
        MATCH (a) where ID(a) = ${latestEvent.identity.low}\
        CREATE (a) -[r:NewAction]-> (b:Event ${n})`
        session
        .run(qstring)
        .then(() => {
            console.log(qstring)
            document.location.reload(true)
        })
        .catch(e => {
            console.log('error with query')
            session.close();
            throw e
        })
        //document.getElementById(`caseID: ${currentCaseID}`).click()
    }
})


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
var editEventForm = document.getElementById('EditEventForm');

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

                                    editEventForm.innerHTML = `
                                    <button id ="closeDeleteCaseButton" type = "submit" >Update</button>`
                                    //                                    <label for= "notes">Notes</label>
                                    //<textarea name = "notes" id = "notes"></textarea>

                                    currentEventProperties = record._fields[0].properties
                                    currentEventNodeId = record._fields[0].identity.low

                                    //add labales and input edits for event edits

                                    labels = Object.keys(currentEventProperties)
                                    if (labels.includes('DateLogged')) { labels.splice(labels.indexOf("DateLogged"),1)}//remove date logged
                                    if (labels.includes('dateLogged')) { labels.splice(labels.indexOf("dateLogged"),1)}//remove date logged
                                    if (labels.includes('neo4jImportId')) {labels.splice(labels.indexOf("neo4jImportId"),1)}
                                    if (labels.includes('Label')) {labels.splice(labels.indexOf("Label"),1)}
                                    if (labels.includes("Notes")) {labels.splice(labels.indexOf("Notes"),1)}

                                    labels.unshift("Notes")            

                                    labels.forEach(element => {
                                        var a = document.createElement('label')   
                                        //console.log(element)
                                        a.textContent = element

                                        var b = document.createElement('input')
                                        b.name = element
                                        b.id = element
                                        b.value = currentEventProperties[element]
                                        //console.log(typeof(currentEventProperties[element]))

                                       editEventForm.prepend(b)
                                       editEventForm.prepend(a)
                                    });
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
var span0 = document.getElementsByClassName("close")[0];
var span1 = document.getElementsByClassName("close")[1];

var addEventForm = document.getElementById('addEventForm');

addEventBtn.onclick = function() {
    eventModal.style.display = "block";
  }

span0.onclick = function() {
    eventModal.style.display = "none"
  }  
span1.onclick = function() {
    editEventModal.style.display = "none"
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
    var input3 = document.getElementById('DateEventStart')
    var input5 = document.getElementById('Completed')
    var input2 = document.getElementById('notes')
    var input4 = new Date()

    //add input checks here
    e.preventDefault();      
    eventModal.style.display = "none";  
        
    var n = 
    `{Label: '${input1.value}', \
    eventStartDate: '${input3.value}',\
    Completed: '${input5.value}',\
    Notes : '${input2.value}',\
    dateLogged: '${input4.toString()}'}\ `

    console.log(n) 
    // run the create command in db
    var session = driver.session();

    if (currentEventsList.length==0){
        qstring = `
        MATCH (a:Case {caseID: '${currentCaseID}'})\
        CREATE (a) -[r:NewAction {Expected_Duration : 5}]-> (b:Event ${n})`
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
        CREATE (a) -[r:NewAction {Expected_Duration : 5}]-> (b:Event ${n})`
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

editEventForm.addEventListener('submit', (e) => {
    n = {}

    st = 'set  '

    labels.forEach( label => {
        l = document.getElementById(label)
        st = st + `n.${label} = '${l.value}',`
        //console.log(l.value)
        //n[label] = l.value
    })

    st = st.slice(0, -1)//remove last comma

    qstring = `MATCH (n) where ID(n) = ${currentEventNodeId}  ` + st

    //add input checks here
    e.preventDefault();      
    eventModal.style.display = "none";  

    //run the create command in db
    
    var session = driver.session();
    session
    .run(qstring)
    .then(() => {
        console.log(qstring)
    })
    .catch(e => {
        console.log(qstring)
        console.log('error with query')
        session.close();
        throw e
    });

    document.location.reload(true)
})



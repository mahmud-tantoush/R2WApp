var viz;

var DBlist = []

var session = driver.session();

function normalize(string) {
    return string.trim().toLowerCase();
    }

//get properties for each case in db     var=DBlist
$.ajax({
    url: '/api/v1/cases/getcases',
    type: 'GET',
    success: (result) => {
        console.log({url: '/api/v1/cases/getcases', type: 'GET'})
        console.log(result)
        DBlist = result
        renderListings(DBlist)
}}).catch(e => {
        console.log(e)
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
                                    if (labels.includes("id")) {labels.splice(labels.indexOf("id"),1)}

                                    labels.unshift("Notes")            

                                    labels.forEach(element => {
                                        var a = document.createElement('label')   
                                        //console.log(element)
                                        a.textContent = element

                                        var b = document.createElement('input')
                                        b.name = element
                                        b.id = element
                                        b.value = currentEventProperties[element]
                                        if ( element == "eventStartDate") {b.type = 'date'}
                                        if ( element == "Expected_Duration") {b.type = 'number'}
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
    var input6 = document.getElementById('PreviousEvent')

    eventModal.style.display = "block";

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

    //attach event list to dropdown add event form
    var input6 = document.getElementById('PreviousEvent')
    var input7 = document.getElementById('ConnectToEvent')
    input6.innerHTML = `<select name="PreviousEvent" id="PreviousEvent">`
    input7.innerHTML = `<select name="ConnectToEvent" id="ConnectToEvent">`

    var eventForward = document.createElement('option')
    eventForward.innerText = 'Default - no forward connecting node'
    eventForward.id = "connectionNotNeeded"
    input7.appendChild(eventForward)

    currentEventsListReversed = currentEventsList.reverse()
    currentEventsListReversed.forEach(function(item){
        var PreviousEventItem = document.createElement('option')
        PreviousEventItem.id = `EventID:${item.identity.low}`
        PreviousEventItem.textContent = "Label:  " + item.properties.Label + ";   ID:  " + item.identity.low + ";  eventStartDate:  " + item.properties.eventStartDate
        PreviousEventItem.data = item
        input6.appendChild(PreviousEventItem)

        var PreviousEventItem1 = document.createElement('option')
        PreviousEventItem1.id = `EventID:${item.identity.low}`
        PreviousEventItem1.textContent = "Label:  " + item.properties.Label + ";   ID:  " + item.identity.low + ";  eventStartDate:  " + item.properties.eventStartDate
        PreviousEventItem1.data = item
        input7.appendChild(PreviousEventItem1)
    })
}

span0.onclick = function() {
    eventModal.style.display = "none"
  }  
span1.onclick = function() {
    editEventModal.style.display = "none"
} 

PreviousEventLabel = document.getElementById('PreviousEventLabel')
ConnectToEventLabel = document.getElementById('ConnectToEventLabel')
PreviousEvent = document.getElementById('PreviousEvent')
ConnectToEvent = document.getElementById('ConnectToEvent')

PreviousEvent.style.display = "none"
ConnectToEvent.style.display = "none"
ConnectToEventLabel.style.display = "none"
PreviousEventLabel.style.display = "none"

toggleEventLinks = document.getElementById('toggleEventLinks')

toggleEventLinks.onclick = function(){

    if(PreviousEvent.style.display == "none"){
        PreviousEvent.style.display = "block"
        ConnectToEvent.style.display = "block"
        ConnectToEventLabel.style.display = "block"
        PreviousEventLabel.style.display = "block"
    } else{
        PreviousEvent.style.display = "none"
        ConnectToEvent.style.display = "none"
        ConnectToEventLabel.style.display = "none"
        PreviousEventLabel.style.display = "none"
    }

    
}


addEventForm.addEventListener('submit', (e) => {

    var input1 = document.getElementById('addEventType')
    var input3 = document.getElementById('DateEventStart')
    var input5 = document.getElementById('Completed')
    var input2 = document.getElementById('notes')
    var input4 = new Date()
    var input6 = document.getElementById('PreviousEvent')
    var input7 = document.getElementById('ConnectToEvent')
    var input8 = document.getElementById('Expected_Duration_add')

    if (input6.value == ""){
        var input6SelectedEvent = false
    }else {
        var input6SelectedEvent = input6.options[input6.selectedIndex].data
    } 

    var input7SelectedEventQuery
    if (input7.value == "Default - no forward connecting node"){
        input7SelectedEventQuery = ""
        matchNextEvent = ""
    } else {
        matchNextEvent = `MATCH (c) where ID(c) = ` +  input7.options[input7.selectedIndex].data.identity.low
        input7SelectedEventQuery = `CREATE (b)-[e:NewAction]-> (c)`
    }

    console.log(input7SelectedEventQuery)

    //add input checks here
    e.preventDefault();      
    eventModal.style.display = "none";  
        
    var n = 
    `{Label: '${input1.value}', \
    eventStartDate: '${input3.value}',\
    Completed: '${input5.value}',\
    Notes : '${input2.value}',\
    Expected_Duration : '${input8.value.toString()}',\
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
            //document.getElementById(`caseID: ${currentCaseID}`).click()
            document.location.reload(true)
        })
        .catch(e => {
            console.log(qstring)
            console.log('error with query')
            session.close();
            throw e
        });
    } else {
        //var latestEvent = currentEventsList[currentEventsList.length - 1]
        qstring = `
        MATCH (a) where ID(a) = ${input6SelectedEvent.identity.low} ${matchNextEvent}\
        CREATE (a) -[r:NewAction {Expected_Duration : 5}]-> (b:Event ${n}) ${input7SelectedEventQuery}`
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
        document.getElementById(`caseID: ${currentCaseID}`).click()
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



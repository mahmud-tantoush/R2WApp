var viz;

var DBlist = []

//var session = driver.session();

function normalize(string) {
    return string.trim().toLowerCase();
    }

//get properties for each case in db     var=DBlist
// fetch('./api/v1/cases/getcases')
// .then((res)=> {
//     res.json().then(data => renderListings(data))
// })
// .catch((err)=> console.log(err))

loadListings()

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

    //console.log(items)
        if (items.length) {
            items.forEach(function(item) {
                //console.log(prop)
                var i = document.createElement('a');
                //console.log(i)
                i.className = 'sideBarListElements'
                i.textContent = item.properties.caseID
                i.id = 'caseID'
                i.addEventListener('click', function() {

                    currentCaseID = item.properties.caseID

                    fetch(`./api/v1/cases/getcase/${currentCaseID}`)
                    .then((res)=> {
                        res.json().then(currCase => {
                            document.getElementById('createCaseForm').style = 'display:block'

                            document.getElementById('titleElement').innerText = `Case: ${item.properties.caseID}`
                            
                            var elCaseID = document.getElementById('caseIDi')
                            elCaseID.value = item.properties.caseID
                            currentCaseID = elCaseID.value
                            var elApplicant = document.getElementById('applicant')
                            elApplicant.value = currCase.applicant
                            var elLocation = document.getElementById('location')
                            elLocation.value = currCase.Location
                            var elPHSv = document.getElementById('PHSv')
                            elPHSv.value = currCase.phsVolunteer
                            var elNotes = document.getElementById('notes')
                            elNotes.value = currCase.notes
                        })
                    })
                    .catch((err)=> console.log(err))

                    //var session = driver.session();

                    //query = `Match (n:Case {caseID: '${item.properties.caseID}'}) return n`

                    //get properties for each case in db     var=DBlist
                    // session
                    //     .run(query)
                    //     .then((result) => {
                    //         console.log(query)
                    //         console.log(result.records[0]._fields[0])
                    //         session.close()
                    //         var currCase = result.records[0]._fields[0]
                    //         //console.log(currCase)

                    //                             //reveal form
                    //         document.getElementById('createCaseForm').style = 'display:block'

                    //         // change CASEID title
                    //         document.getElementById('titleElement').innerText = `Case: ${item.properties.caseID}`
                            
                    //         var elCaseID = document.getElementById('caseIDi')
                    //         elCaseID.value = item.properties.caseID
                    //         currentCaseID = elCaseID.value
                    //         var elApplicant = document.getElementById('applicant')
                    //         elApplicant.value = currCase.properties.applicant
                    //         var elLocation = document.getElementById('location')
                    //         elLocation.value = currCase.properties.Location
                    //         var elPHSv = document.getElementById('PHSv')
                    //         elPHSv.value = currCase.properties.phsVolunteer
                    //         var elNotes = document.getElementById('notes')
                    //         elNotes.value = currCase.properties.notes

                    //     })
                    //     .catch(e => {
                    //         console.log(e)
                    //         //session.close();
                    //         //throw e
                    //     });

                });
                listingEl.appendChild(i);
            // Show the filter input
            filterEl.parentNode.style.display = 'block';
            })
        }
}

caseManagementForm.addEventListener('submit', (e) => {
    var caseIDi = document.getElementById('caseIDi')
    var applicant = document.getElementById('applicant')
    var loc = document.getElementById('location')
    var phsVolunteer = document.getElementById('PHSv')
    var notes = document.getElementById('notes')

    e.preventDefault();
    
    var n = `{"caseID": "${caseIDi.value}", \
    "applicant": "${applicant.value}",\
    "Location": "${loc.value}",  \
    "phsVolunteer": "${phsVolunteer.value}", \
    "notes" : "${notes.value}"}`

    console.log(n) 

    // run the create command in db
    $.ajax({
        url: `/api/v1/cases/updatecase/${currentCaseID}`,
        type: 'POST',
        contentType: 'application/json',
        data: n,
        success: function(res){
            console.log(res)
            if(res.status == 1){
                createCaseForm.innerHTML = "<h6><b>Case Updated, page is reloading</b></h6>"
                document.location.reload(true)
            }
            else{
                createCaseForm.innerHTML = "<h6><b>Case not Updated, error with data sent to server</b></h6>"
                console.log('error with prossessing form ')
            }
        }})
        .catch(e => {
            console.log(e)
            console.log(req.body)
        });

    // var session = driver.session();
    // qstring = `MATCH (n:Case {caseID: '${currentCaseID}'})\
    // set n = ${n}`
    // session
    // .run(qstring)
    // .then(() => {
    //     console.log(qstring)
    //     createCaseForm.innerHTML = "<h6><b>Case Updated, page is reloading</b></h6>"
    //     document.location.reload(true)
    // })
    // .catch(e => {
    //     console.log(qstring)
    //     console/log('error with query')
    //     session.close();
    //     throw e
    // });
})

var deleteCaseButton = document.getElementById('DeleteCaseButton')
var confimDeleteCaseButton = document.getElementById('confimDeleteCaseButton')
var closeDeleteCaseButton = document.getElementById('closeDeleteCaseButton')
var span = document.getElementsByClassName("close")[0];
var modalTitle = document.getElementById('modalTitle');
var confirmDeleteModal = document.getElementById("ConfirmDeleteModal");

deleteCaseButton.onclick = function() {
    confirmDeleteModal.style.display = "block";
    modalTitle.innerHTML = `<h2 id='modalTitle'>Delete confimation: Case ${currentCaseID}</h2>`
  }

span.onclick = function() {
    confirmDeleteModal.style.display = "none"
  }  

closeDeleteCaseButton.onclick = function (){
    span.click()
}

confimDeleteCaseButton.onclick = function(){
    // qstring = `MATCH (p:Case {caseID: '${currentCaseID}'}) 
    // CALL apoc.path.subgraphAll(p, {relationshipFilter: ">", minLevel: 0, maxLevel: 100 })
    // YIELD nodes
    // FOREACH (n IN nodes| detach delete n)`

    $.ajax({
        url: `/api/v1/cases/case/${currentCaseID}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function(res){
            console.log(res)
            if(res.status == 1){
                createCaseForm.innerHTML = "<h6><b>Case deleted, page is reloading</b></h6>"
                document.location.reload(true)
                //res.json({'Success': 1})
            }
            else{
                createCaseForm.innerHTML = "<h6><b>Case not deleted, error with data sent to server</b></h6>"
                console.log('error with prossessing form ')
                //res.json({'Success': 0})
            }
        }})
        .catch(e => {
            console.log(e)
            res.send(e)
        });

}
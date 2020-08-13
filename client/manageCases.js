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
                //console.log(prop)
                var i = document.createElement('a');
                //console.log(i)
                i.className = 'sideBarListElements'
                i.textContent = prop.caseID
                i.id = 'caseID'
                i.addEventListener('click', function() {

                    //reveal form
                    document.getElementById('createCaseForm').style = 'display:block'

                    // change CASEID title
                    document.getElementById('titleElement').innerText = `Case: ${prop.caseID}`
                    
                    var elCaseID = document.getElementById('caseIDi')
                    elCaseID.value = item.properties.caseID.low
                    currentCaseID = elCaseID.value
                    var elApplicant = document.getElementById('applicant')
                    elApplicant.value = item.properties.applicant
                    var elLocation = document.getElementById('location')
                    elLocation.value = item.properties.location
                    var elPHSv = document.getElementById('PHSv')
                    elPHSv.value = item.properties.phsVolunteer
                    var elNotes = document.getElementById('notes')
                    elNotes.value = item.properties.notes
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
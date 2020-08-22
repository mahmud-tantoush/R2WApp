var createCaseForm = document.getElementById("createCaseForm")

var caseID = document.getElementById('caseID')
var applicant = document.getElementById('applicant')
var loc = document.getElementById('location')
var phsVolunteer = document.getElementById('PHSv')
var notes = document.getElementById('notes')

var errorElement = document.getElementById('error')

/*
    console.log(applicant.value)
    console.log(loc.value)
    console.log(phsVolunteer.value)
    console.log(notes.value)*/

createCaseForm.addEventListener('submit', (e) => {
    console.log(typeof(caseID.value))

    e.preventDefault();
    var eMessages = []

    console.log(Number(caseID.value))

    //check case id is number
    if(Number(caseID.value)){
        //console.log('caseID is valid')
    } else{
        eMessages.push('CaseID must be a number')
        errorElement.innerText = eMessages.join(', ')
        console.log('caseID is invalid')
    }

    if(eMessages.length == 0){  //data format is good
        
        errorElement.innerText = ''
        
        var newCase = `{caseID: '${caseID.value}', \
        applicant: '${applicant.value}',\
        Location: '${loc.value}',  \
        phsVolunteer: '${phsVolunteer.value}', \
        dateLogged : '${new Date()}', \
        notes : '${notes.value}'}`

        console.log(newCase) 
        // run the create command in db
        var session = driver.session();
        session
        .run(`create (n:Case ${newCase}) return n`)
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
            //console.log('got through the second then')
            createCaseForm.innerHTML = "<h6><b>Case Created, go to the <a href='index.html'>graphs page </a> to view</b></h6>"
        })
        .catch(e => {
            session.close();
            throw e
        });
    }


})

//console.log(createCaseForm)
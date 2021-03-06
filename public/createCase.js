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

    //console.log(Number(caseID.value))

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
        
        dateLogged = new Date() 
        var newCase = `{"caseID": "${caseID.value}", \
        "applicant": "${applicant.value}",\
        "Location": "${loc.value}",  \
        "phsVolunteer": "${phsVolunteer.value}", \
        "dateLogged" : "${dateLogged.toISOString()}", \
        "notes" : "${notes.value}"}`

        //console.log(JSON.stringify(newCase)) 
        $.ajax({
        url: '/api/v1/cases/createcase',
        type: 'POST',
        contentType: 'application/json',
        data: newCase,
        success: function(response){
            console.log(response)
            console.log(response.status)

            if (response.status == 0){
            createCaseForm.innerHTML = "<h6><b>caseID already exists, please try again with new caseID. <a href='createCase.html'>Create case page </a></b></h6>"
            }
            else{
            createCaseForm.innerHTML = "<h6><b>Case Created, go to the <a href='index.html'>graphs page </a> to view</b></h6>"
            }
        }})
        .catch(e => {
            console.log(e)
        });
    
    }
})

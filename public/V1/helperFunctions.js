
function loadListings(){
    fetch('./api/v1/cases/getcases')
        .then((res)=> {
            res.json().then(data => renderListings(data))
        })
        .catch((err)=> console.log(err))
}


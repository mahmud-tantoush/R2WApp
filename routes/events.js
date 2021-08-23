const express = require('express');
const router = express.Router();
const driver = require('../driver.js');

//general utility: converts identify to number in javascript
function toNumber({ low, high }) {
    let res = high
    for (let i = 0; i < 32; i++) {
      res *= 2
    }
    return low + res
}


//get
router.get(``, (req, res)=>{
    const session = driver.session()
    q = `match (n) return n`
    console.log(q)
    session.run(q) 
      .then(result => {
        session.close();
        res.json()
      })
      .catch(error => {
        session.close();
        res.send(error)
      })
})

module.exports = router;
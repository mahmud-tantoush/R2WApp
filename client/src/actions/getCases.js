import axios from 'axios'
import { resetWarningCache } from 'prop-types'

const getCases = () => { 
    axios
        .get('./api/cases/getall')
        .then(res => {
            console.log(res)
            return res})
        .catch(err => console.log(err))
}

export default getCases

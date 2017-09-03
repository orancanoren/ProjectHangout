import axios from 'axios';

var getData = {};
var requestPost = function(id) {
    return axios.get('localhost:3000/api/mydata/id')
    .then(res => {
        return {
            data: res.data.data
        }
    });
}

export default getData;
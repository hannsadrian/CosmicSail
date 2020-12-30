const axios = require("axios").default

function isAuthorized() {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem("username") == null || localStorage.getItem("token") == null)
            reject()

        axios.post(process.env.REACT_APP_APIURL + "/v1/status", {}, {headers: {"Authorization": "Bearer " + localStorage.getItem("token")}}).catch(err => {
            reject()
        }).then(res => {
            if (res == null) {
                reject()
                return
            }
            if (res.data.payload.Username !== localStorage.getItem("username"))
                reject()
            resolve()
        })
    })
}

module.exports = {isAuthorized}
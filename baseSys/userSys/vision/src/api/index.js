class Net {
    constructor(option = {}) {
        this.baseUrl = option.baseUrl ? option.baseUrl.slice(-1) != '/' ? option.baseUrl + '/' : option.baseUrl : ''
    }

    get(url, data = null, option = null) {
        return new Promise((res, rej) => {
            let URL
            if (url[0] != '/') {
                URL = this.baseUrl + url
            } else {
                URL = this.baseUrl + url.slice(1)
            }
            URL = URL + JSON.stringify(data).replace(/:/g, '=').replace(/,/g, '&').replace(/{/g, '?').replace(/}/g, '').replace(/"/g, '')

            fetch(URL, {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
            }).then(
                response => {
                    if (response.status >= 200 && response.status < 300) {
                        response.json().then(
                            json => {
                                res(json)
                            }
                        ).catch(
                            e => rej(e)
                        )
                    } else {
                        rej(response.statusText)
                    }
                }
            ).catch(
                e => {
                    rej(e)
                }
            )
        })
    }

    post(url, data = null, option = null) {
        return new Promise((res, rej) => {
            let URL
            if (url[0] != '/') {
                URL = this.baseUrl + url
            } else {
                URL = this.baseUrl + url.slice(1)
            }
            const form = new FormData();
            for (let i in data) {
                form.append(i, data[i]);
            }
            fetch(URL, {
                method: 'POST',
                body: form
            }).then(
                response => {
                    if (response.status >= 200 && response.status < 300) {
                        response.json().then(
                            json => {
                                res(json)
                            }
                        ).catch(
                            e => rej(e)
                        )
                    } else {
                        rej(response.statusText)
                    }
                }
            ).catch(
                e => {
                    rej(e)
                }
            )
        })
    }

    request(option) {

    }
}

export const net = new Net({
    baseUrl: 'api/user'
})

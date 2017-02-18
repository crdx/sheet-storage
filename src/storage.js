let auth = require("./auth.js")
let API = require("./api.js")

module.exports = class {
    async get(name) {
        return (await this.instance).get(name)
    }

    async set(name, value) {
        return (await this.instance).set(name, value)
    }

    constructor(sheetId) {
        this.instance = new Promise((resolve, reject) => {
            auth(function(creds) {
                let api = new API(creds, sheetId)

                let findRowIdx = async function(key) {
                    let keys = await api.get('A1:A99999999')
                    let i = 1
                    let matchIdx = null
                    let gapIdx = null

                    if (keys) {
                        for (let [ k ] of keys) {
                            if (typeof k === 'undefined') {
                                gapIdx = i
                            }

                            if (k == key) {
                                matchIdx = i
                            }

                            ++i
                        }
                    }

                    if (gapIdx === null) {
                        gapIdx = i
                    }

                    if (matchIdx) {
                        return { found: true, idx: matchIdx }
                    } else {
                        return { found: false, idx: gapIdx }
                    }
                }

                resolve(class {
                    static async get(name) {
                        if (name == 'then') { // No, we're definitely not a promise...
                            return undefined
                        }

                        let { found, idx } = await findRowIdx(name)
                        if (found) {
                            let [[ value ]] = await api.get(`B${idx}:B${idx}`)
                            return value
                        } else {
                            return null
                        }
                    }

                    static async set(name, value) {
                        let { found, idx } = await findRowIdx(name)
                        return await api.set(`A${idx}:B${idx}`, [[ name, value ]])
                    }
                })
            })
        })
    }
}

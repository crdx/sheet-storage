let google = require('googleapis');

module.exports = class {
    constructor(creds, sheetId) {
        this.creds = creds
        this.sheetId = sheetId
        this.sheets = google.sheets('v4')
    }

    buildConfig(range) {
        return {
            auth: this.creds,
            spreadsheetId: this.sheetId,
            range: range
        }
    }

    set(range, rows) {
        return new Promise((resolve, reject) => {
            let config = this.buildConfig(range)
            config.valueInputOption = 'USER_ENTERED'
            config.resource = { values: rows }

            this.sheets.spreadsheets.values.update(
                config,
                function(err, res) {
                    err ? reject(err) : resolve(res)
                }
            )
        })
    }

    get(range) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get(
                this.buildConfig(range),
                function(err, res) {
                    err ? reject(err) : resolve(res.values)
                }
            )
        })
    }
}

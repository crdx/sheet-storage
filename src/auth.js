let fs = require('fs')
let readline = require('readline')
let googleAuth = require('google-auth-library')

let SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
let CACHE_PATH = process.env.CACHE_PATH
let TOKEN_PATH = process.env.TOKEN_PATH

function authorise(credentials, callback) {
    let clientSecret = credentials.installed.client_secret
    let clientId = credentials.installed.client_id
    let redirectUrl = credentials.installed.redirect_uris[0]
    let auth = new googleAuth()
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

    fs.readFile(CACHE_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback)
        } else {
            oauth2Client.credentials = JSON.parse(token)
            callback(oauth2Client)
        }
    })
}

function getNewToken(oauth2Client, callback) {
    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })

    console.log('Authorise this app by visiting this url: ', authUrl)

    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question('Enter the code from that page here: ', function(code) {
        rl.close()

        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error trying to retrieve access token', err)
                return
            }

            oauth2Client.credentials = token
            storeToken(token)
            callback(oauth2Client)
        })
    })
}

function storeToken(token) {
    fs.writeFile(CACHE_PATH, JSON.stringify(token))
    console.log('Token stored to ' + CACHE_PATH)
}

module.exports = function(cb) {
    fs.readFile(TOKEN_PATH, function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err)
            return
        }
        authorise(JSON.parse(content), cb)
    })
}

require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const axios = require('axios')
const request = require('request') // request is deprecated (alt? axios w/ promises)

const PORT = 3000
const stateKey = 'spotify_auth_state'
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const redirect_uri = 'http://localhost:' + PORT + '/callback'

function generateRandomString (length) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const app = express()

app.use(express.static(__dirname + '/src'))
  // TODO - why do we need
  .use(cookieParser())

app.get('/login', function(req, res) {
  const state = generateRandomString(16)
  res.cookie(stateKey, state)

  const scope = 'user-library-read playlist-modify-private'
  // [https://developer.spotify.com/documentation/general/guides/authorization-guide/]
  // 1. Request authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    'response_type=code' +
    '&client_id=' + CLIENT_ID +
    '&scope=' + encodeURIComponent(scope) +
    '&redirect_uri=' + encodeURIComponent(redirect_uri) +
    '&state=' + state
  )
})

app.get('/callback', function(req, res) {
  var code = req.query.code || null
  var state = req.query.state || null
  var storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      'error=state_mismatch'
    )
  } else {
    res.clearCookie(stateKey)
    // [https://developer.spotify.com/documentation/general/guides/authorization-guide/]
    // 2. Application requests refresh and access tokens
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        // we can't remove new Buffer, but why do we need, where does it come from..?
        // 'Authorization': 'Basic ' + (CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
      },
      json: true
    }

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token
        const refresh_token = body.refresh_token

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body)
          res.redirect('/#' +
            'id=' + body.id +
            '&access_token=' + encodeURIComponent(access_token) +
            '&refresh_token=' + encodeURIComponent(refresh_token)
          )
        })
      } else {
        res.redirect('/#' +
          'error=invalid_token'
        )
      }
    })
  }
})

console.log('Listening on ' + PORT)
app.listen(PORT)
var sorted
var tracks = []
var audioFeatures = []
var fullPrecision = true
var sortByFeature = false
var offset = 0
var limit = 50
var token
var sortBy

const features = ['Acousticness', 'Danceability', 'Speechiness', 'Tempo', 'Valence' ]

function makeSortedPlaylist(access_token, sort) {
  token = access_token
  sortBy = sort

  if (sortBy in features) {
    sortByFeature = true
  }

  getUserTracks()
}

function getUserTracks() {
  console.log('offset: ' + offset)
  $.ajax({
    url: 'https://api.spotify.com/v1/me/tracks?limit=' + limit + '&offset=' + offset,
    headers: {
      'Authorization': 'Bearer ' + token
    },
    success: (data) => userTracksSuccess(data)
  })
}

function userTracksSuccess(data) {
  for (let i in data.items) {
    tracks.push(data.items[i])
  }

  if (sortByFeature) {
    getAudioFeatures(data.items)
  }

  if (data.items.length === limit) {
    offset += limit
    getUserTracks()
  } else if (!sortByFeature) {
    postPlaylist()
  }
}

function getAudioFeatures(items) {
  let idsList = ''
  for (let i in items) {
    idsList += items[i].track.id + ','
  }
  idsList = idsList.slice(0, -1)

  $.ajax({
    url: 'https://api.spotify.com/v1/audio-features?ids=' + idsList,
    headers: {
      'Authorization': 'Bearer ' + token
    },
    success: (data) => getAudioFeaturesSuccess(data)
  })
}

function getAudioFeaturesSuccess(data) {
  audioFeatures = audioFeatures.concat(data['audio_features'])
  if (data['audio_features'].length !== limit) {
    postPlaylist()
  }
}

function postPlaylist() {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', 'https://api.spotify.com/v1/users/ian_sadler/playlists', true)
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  xhr.setRequestHeader('Authorization', 'Bearer ' + token)
  xhr.onload = function() {
    postPlaylistSuccess(this.response)
  }

  const params = {
    "name": sortBy,
    "description": "This playlist was auto-generated from the users' liked songs, and sorted by " + sortBy + '.',
    "public": false
  }
  xhr.send(JSON.stringify(params))
}

function postPlaylistSuccess(data) {
  sorted = sortTracks(tracks, audioFeatures, sortBy)
  let json = JSON.parse(data)
  let id = json.id
  let length = sorted.length

  let i = 0
  setTimeout(function() {
   createURIString(i, id)
  }, 900)
}

function ajaxRequestPostToPlaylist(id, uris) {
  var xhr = new XMLHttpRequest()
  let url = 'https://api.spotify.com/v1/playlists/' + id + '/tracks?' + uris
  console.log(url)

  xhr.open('POST', url, true)
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', 'Bearer ' + token)
  xhr.send(null)
}

function createURIString(i, id) {
  let count = 0
  let uris = 'uris='

  for (i; i < sorted.length && count < 40; i++) {
    count++
    if (sortBy === 'Date' || sortBy === 'Popularity') {
      uris += 'spotify%3Atrack%3A' + sorted[i].track.id + ','
    } else if (sortByFeature) {
      uris += 'spotify%3Atrack%3A' + sorted[i].id + ','
    }
  }

  uris = uris.slice(0, -1)
  ajaxRequestPostToPlaylist(id, uris)

  if (i < sorted.length && count == 40) {
    setTimeout(function() {
      createURIString(i, id)
    }, 900)
  }
}
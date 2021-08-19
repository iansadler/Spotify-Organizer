function sortTracks(tracks, audioFeatures, sortBy) {
  if (sortBy === 'Popularity') {
    return tracks.sort(compareByPopularity)
  } else if (sortByFeature) {
    return audioFeatures.sort((a,b) => compareByAudioFeature(a, b, sortBy))
  } else {
    return tracks.sort(compareByRelease)
  }
}

function compareByAudioFeature(a, b, audioFeature) {
  let feat = audioFeature.toLowerCase()
  if (a[feat] < b[feat]) {
    return 1
  } else if (a[feat] > b[feat]) {
    return -1
  }
  return 0
}

function compareByPopularity(a, b) {
  if (a.track.popularity < b.track.popularity) {
    return 1
  } else if (a.track.popularity > b.track.popularity) {
    return -1
  }
  return 0
}

function compareByRelease(a, b) {
  let date1 = formatDate(a.track.album).getTime()
  let date2 = formatDate(b.track.album).getTime()

  if (date1 < date2) {
    return 1
  } else if (date1 > date2) {
    return -1
  }
  return 0
}

function formatDate(album) {
  if (album.release_date_precision === 'day') {
    dateData = album.release_date.split('-')
    return new Date(dateData[0], dateData[1], dateData[2])
  } else if (album.release_date_precision === 'month') {
    dateData = album.release_date.split('-')
    return new Date(parseInt(dateData[0]), parseInt(dateData[1]), 1)
  } else if (album.release_date_precision === 'year') {
    dateData = album.release_date
    return new Date(dateData, 11, 1)
  }
}
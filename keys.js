
function getKeys(chart, mode) {
  if (mode === 'dtx') {
    return getKeysDtx(chart)
  } else {
    return getKeysBms(chart)
  }
}

function getKeysDtx(chart) {
  var objects = chart.objects.all()
  var stat = { }
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i]
    var channel = object.channel
    if (channel[0] !== '1') {
      continue
    }

    stat[channel] = (stat[channel] || 0) + 1
  }

  if (Object.keys(stat).length === 0) return 'empty'

  if (stat['16'] || stat['18'] || stat['17'] || stat['1A']) {
    // Use 12 keys if there are cymbals, open hihat or floor tom
    return '12K'
  }
  else {
    return '8K'
  }
}

function getKeysBms(chart) {
  var objects = chart.objects.all()
  var stat = {}
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i]
    var channel = +object.channel
    if (50 <= channel && channel <= 69) channel -= 40
    if (channel < 10) continue
    if (channel > 29) continue
    stat[channel] = (stat[channel] || 0) + 1
  }
  var channels = Object.keys(stat).map(function(ch) { return +ch })
  if (channels.length === 0) return 'empty'
  if (channels.some(isSecondPlayer)) {
    return (stat[18] || stat[19] || stat[28] || stat[29]) ? '14K' : '10K'
  }
  return (stat[18] || stat[19]) ? '7K' : '5K'

  function isSecondPlayer(ch) {
    return 20 <= ch && ch <= 29
  }
}

module.exports = getKeys


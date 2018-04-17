
var expect = require('chai').expect
var indexer = require('./')

require('chai').use(require('chai-as-promised'))
require('./lcs_spec')

describe('getFileInfo (bms)', function() {

  function info(source) {
    return indexer.getFileInfo(new Buffer(source), { name: 'meow.bms' })
  }

  describe('.md5', function() {
    it('should return hash', function() {
      return expect(info('').get('md5'))
          .to.eventually.equal('d41d8cd98f00b204e9800998ecf8427e')
    })
  })

  describe('.info', function() {
    it('should return song info', function() {
      var source = '#TITLE meow'
      return expect(info(source).get('info').get('title'))
          .to.eventually.equal('meow')
    })
  })

  describe('.noteCount', function() {
    it('should not count BGM', function() {
      var source = '#00101:01'
      return expect(info(source).get('noteCount')).to.eventually.equal(0)
    })
    it('should count playable notes', function() {
      var source = '#00111:01'
      return expect(info(source).get('noteCount')).to.eventually.equal(1)
    })
  })

  describe('.scratch', function() {
    it('is false when no scratch track', function() {
      var source = '#00101:01'
      return expect(info(source).get('scratch')).to.eventually.be.false
    })
    it('should count playable notes', function() {
      var source = '#00116:01'
      return expect(info(source).get('scratch')).to.eventually.be.true
    })
  })

  describe('.keys', function() {
    it('should be empty when no notes', function() {
      var source = '#00101:01'
      return expect(info(source).get('keys')).to.eventually.equal('empty')
    })
    it('should be 7K on normal chart', function() {
      var source = [
        '#00111:01',
        '#00114:01',
        '#00159:0101',
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('7K')
    })
    it('should be 5K when 6th and 7th keys not detected', function() {
      var source = [
        '#00111:01',
        '#00114:01',
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('5K')
    })
    it('should be 14K on doubles chart', function() {
      var source = [
        '#00111:01',
        '#00114:01',
        '#00159:0101',
        '#00121:01',
        '#00124:01',
        '#00129:0101',
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('14K')
    })
    it('should be 10K when 2 players and ' +
        '6th and 7th keys not detected', function() {
      var source = [
        '#00111:01',
        '#00114:01',
        '#00121:01',
        '#00124:01',
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('10K')
    })
  })

  describe('.duration', function() {

    it('should be correct', function() {
      var source = [
        '#BPM 120',
        '#00111:0101',
      ].join('\n')
      return expect(info(source).get('duration')).to.eventually.equal(3)
    })

  })

  describe('.bpm', function() {

    var source = [
      '#BPM 120',
      '#BPM01 240',
      '#00111:01',
      '#00108:01',
      '#00203:3C78',
      '#00211:01',
      '#00311:01',
    ].join('\n')

    var bpm

    beforeEach(function() {
      return info(source).get('bpm').tap(function(x) { bpm = x })
    })

    it('init should be the BPM at first beat', function() {
      expect(bpm.init).to.equal(120)
    })
    it('median should be the median BPM', function() {
      expect(bpm.median).to.equal(120)
    })
    it('min should be the minimum BPM', function() {
      expect(bpm.min).to.equal(60)
    })
    it('max should be the maximum BPM', function() {
      expect(bpm.max).to.equal(240)
    })

  })

})

describe('getFileInfo (dtx)', function() {

  function info(source) {
    return indexer.getFileInfo(new Buffer(source), { name: 'meow.dtx' })
  }

  describe('.md5', function() {
    it('should return hash', function() {
      return expect(info('').get('md5'))
        .to.eventually.equal('d41d8cd98f00b204e9800998ecf8427e')
    })
  })

  describe('.info', function() {
    it('should return song info', function() {
      var source = '#TITLE: meow'
      return expect(info(source).get('info').get('title'))
        .to.eventually.equal('meow')
    })
  })

  describe('.noteCount', function() {
    it('should not count BGM', function() {
      var source = '#00101: 01'
      return expect(info(source).get('noteCount')).to.eventually.equal(0)
    })
    it('should count playable notes', function() {
      var source = '#00111: 01'
      return expect(info(source).get('noteCount')).to.eventually.equal(1)
    })
  })

  describe('.scratch', function() {
    it('is false when no scratch track', function() {
      var source = '#00101: 01'
      return expect(info(source).get('scratch')).to.eventually.be.false
    })
    it('is false with scratch track too', function() {
      var source = '#00116: 01'
      return expect(info(source).get('scratch')).to.eventually.be.false
    })
  })

  describe('.keys', function() {
    it('should be empty when no notes', function() {
      var source = '#00101: 01'
      return expect(info(source).get('keys')).to.eventually.equal('empty')
    })
    it('should be 12K when left cymbal presented', function() {
      var source = [
        '#0011A: 01'
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('12K')
    })
    it('should be 12K when right cymbal presented', function() {
      var source = [
        '#00116: 01'
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('12K')
    })
    it('should be 12K when floor tom presented', function() {
      var source = [
        '#00117: 01'
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('12K')
    })
    it('should be 12K when open hihat presented', function() {
      var source = [
        '#00118: 01'
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('12K')
    })
    it('should be 8K when no cymbals, open hihat or floor tom detected', function() {
      var source = [
        '#00111: 01',
        '#00114: 01',
      ].join('\n')
      return expect(info(source).get('keys')).to.eventually.equal('8K')
    })
  })

  describe('.duration', function() {

    it('should be correct', function() {
      var source = [
        '#BPM: 120',
        '#00111: 0101',
      ].join('\n')
      return expect(info(source).get('duration')).to.eventually.equal(3)
    })

  })

  describe('.bpm', function() {

    var source = [
      '#BPM: 120',
      '#BPM01: 240',
      '#00111: 01',
      '#00108: 01',
      '#00203: 3C78',
      '#00211: 01',
      '#00311: 01',
    ].join('\n')

    var bpm

    beforeEach(function() {
      return info(source).get('bpm').tap(function(x) { bpm = x })
    })

    it('init should be the BPM at first beat', function() {
      expect(bpm.init).to.equal(120)
    })
    it('median should be the median BPM', function() {
      expect(bpm.median).to.equal(120)
    })
    it('min should be the minimum BPM', function() {
      expect(bpm.min).to.equal(60)
    })
    it('max should be the maximum BPM', function() {
      expect(bpm.max).to.equal(240)
    })

  })

})


describe('getFileInfo (bmson)', function() {

  function info(bmson) {
    var source = JSON.stringify(bmson)
    return indexer.getFileInfo(new Buffer(source), { name: 'meow.bmson' })
  }

  describe('.info', function() {
    it('should return song info', function() {
      return (
        expect(info({ info: { title: 'Running Out' } })
          .get('info')
          .get('title')
        )
        .to.eventually.equal('Running Out')
      )
    })
  })

  describe('.bga', function() {
    it('is undefined if no bga', function() {
      return (
        expect(info({ info: { title: 'Running Out' } })
          .get('bga')
        )
        .to.eventually.equal(undefined)
      )
    })
    it('has timing ', function() {
      var bmsonData = {
        version: '1.0.0',
        info: {
          title: 'Meow',
          init_bpm: 42
        },
        bga: {
          bga_events: [ { id: 1, y: 240 } ],
          bga_header: [ { id: 1, name: 'meow.mp4' } ]
        }
      }
      return (
        expect(info(bmsonData).get('bga'))
        .to.eventually.deep.equal({
          file: 'meow.mp4',
          offset: 60 / 42
        })
      )
    })
  })
})


describe('getSongInfo', function() {

  describe('with multiple files', function() {

    var files = [
      {
        name: '01.bms',
        data: new Buffer(
            '#TITLE meow [NORMAL]\n' +
            '#ARTIST lol\n' +
            '#PLAYLEVEL 5\n' +
            '#BPM 123\n' +
            '#00111:1111'),
      },
      {
        name: '02.bms',
        data: new Buffer(
            '#TITLE meow [HYPER]\n' +
            '#ARTIST lol\n' +
            '#PLAYLEVEL 7\n' +
            '#BPM 123\n' +
            '#00111:1111'),
      },
      {
        name: '03.bms',
        data: new Buffer(
            '#TITLE meow [ANOTHER]\n' +
            '#ARTIST lol\n' +
            '#PLAYLEVEL 12\n' +
            '#BPM 123\n' +
            '#00111:1111'),
      },
    ]

    var song

    beforeEach(function() {
      return indexer.getSongInfo(files).tap(function(x) { song = x })
    })

    describe('title', function() {
      it('should be correct', function() {
        expect(song.title).to.equal('meow')
      })
    })
    describe('artist', function() {
      it('should be correct', function() {
        expect(song.artist).to.equal('lol')
      })
      it('should be overridable', function() {
        var options = { extra: { artist: 'meowmeow' } }
        return expect(indexer.getSongInfo(files, options).get('artist'))
            .to.eventually.equal('meowmeow')
      })
    })
    describe('charts', function() {
      it('should be an array of charts', function() {
        expect(song.charts).to.have.length(3)
      })
      it('should have the file key', function() {
        expect(song.charts[0].file).to.match(/\.bms/)
      })
    })
    describe('progress report', function() {
      it('should report progress', function() {
        var options = { onProgress: onProgress }
        var callCount = 0
        function onProgress() {
          callCount += 1
        }
        return indexer.getSongInfo(files, options).then(function() {
          expect(callCount).to.equal(3)
        })
      })
    })
  })

  describe('a song’s video', function () {
    it('is taken from an available bga in a chart', function () {
      var charts = [
        { },
        { bga: { file: 'a.mp4', offset: 2 } },
        { }
      ]
      expect(indexer._getSongVideoFromCharts(charts).video_file).to.equal('a.mp4')
      expect(indexer._getSongVideoFromCharts(charts).video_offset).to.equal(2)
    })
  })

})

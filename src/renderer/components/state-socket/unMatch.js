var fs = require('fs')
const FILE_PATH = 'C:\\robot\\keyWords.json'

function unMatch () {
  var _obj = null
  this.matchKeyWords = _matchKeyWords

  // 创建cache文件夹
  if (!fs.existsSync(FILE_PATH)) {
    return
  }
  function _matchKeyWords (text) {
    if(!_obj) {
      _getDataFromFile()
    }
    for (var i = 0; i < _obj.length; i++) {
      var words = _obj[i].words
      for (var j = 0; j < words.length; j++){
        if (text.indexOf(words[j]) > -1) {
          return _obj[i].playText
        }
      }
    }
  }
  // 从文件中读取数据
  function _getDataFromFile () {
    var content = fs.readFileSync(FILE_PATH, 'utf-8')
    if (content) {
      _obj = JSON.parse(content)
    }
    if (!_obj) {
      return
    }
  }
}

var instance = new unMatch()
export default instance

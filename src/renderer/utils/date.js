const format = (date) => {
    let t = {}
    let time = ''
    let week = ''
    let dat = new Date(date)
    var month = dat.getMonth() + 1
    var monthn
    if (month < 10) {
      monthn = '0' + month
    } else {
      monthn = month
    }
    var dayn = ''
    var day = dat.getDate()
    if (day < 10) {
      dayn = '0' + day
    } else {
      dayn = day
    }
    week = date.getDay()
    time = dat.getFullYear() + '-' + monthn + '-' + dayn
  
    t = {'week': week, 'day': time}
    return t
  }
  
  export {format}
  
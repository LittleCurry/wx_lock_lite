
module.exports = {
  formatTime: formatTime,
  getTimeNormal: getTimeNormal,
  getHeader: getHeader,
  getPathParams: getPathParams,
  getTime: getTime,
  transTime: transTime,
  getPrice:getPrice

}
//格式化时间样式
function formatTime(payTime) {
  var time = ''
  time = payTime * 1000
  var date = new Date(time)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var min = date.getMinutes()
  return year + "-" + _getTimeStr(month) + "-" + _getTimeStr(day) + " " + _getTimeStr(hour) + ":" + _getTimeStr(min)
}

function _getTimeStr(t) {
  return t < 10 ? "0" + t : t
}
//格式化停车时间段字符串
function getTimeNormal(beginTime, endTime) {
  var bHour = beginTime / 100
  var bMin = beginTime % 100

  var eHour = endTime / 100
  var eMin = endTime % 100
  return ((bHour.toFixed(0)) < 10 ? "0" + bHour.toFixed(0) : bHour.toFixed(0)) + ":" + (bMin == 0 ? "00" : bMin.toFixed(0)) + " - " + eHour.toFixed(0) + ":" + (eMin == 0 ? "00" : eMin.toFixed(0))
}
//获取header信息
function getHeader() {
  var session = wx.getStorageSync('Session')
  var paramDefault = { 'Session': session }
  var param = arguments[0] ? arguments[0] : {}
  return Object.assign(paramDefault, param)
}
//获取Path中的参数对象
function getPathParams(path) {
  var obj = {}
  var splits = new Array()
  splits = path.split("?")[1].split("&")
  for (var i = 0; i < splits.length; i++) {
    obj[splits[i].split("=")[0]] = splits[i].split("=")[1]
  }
  return obj
}
//计算当前停车时间
function getTime(time) {
  var seconds = 0;
  var minutes = 0;
  var hours = 0;
  var dates = 0;
  var parkTime;
  if (time >= 86400) {
    dates = parseInt(time / 86400)
    hours = parseInt(time % 86400 / 3600)
    parkTime = dates + '天' + hours + '小时'
  } else if (time < 86400 && time > 3600) {
    hours = parseInt(time / 3600);
    minutes = parseInt(time % 3600 / 60)
    parkTime = hours + '小时' + minutes + '分钟'
  } else {
    minutes = parseInt(time / 60)
    seconds = parseInt(time % 60)
    parkTime = minutes + '分钟' + seconds + '秒'
  }
  return parkTime
}
//获取当前停车价格
function getInfo() {

}
//时间戳转换
function transTime(now) {
  var time = new Date(now * 1000).toLocaleDateString().replace(/\//g, "-") + " " + new Date(now * 1000).toTimeString().substr(0, 8)
  return time
}
//获取价格
function getPrice(srt_id) {
 var newList = new Array();
  wx.request({
    url: 'https://wx.iguiyu.com/parking/getPrice/short_id/' + srt_id,

    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: getHeader(), // 设置请求的 header
    success: function (res) {
      for (var i = 0; i < res.data.list.length; i++) {
        newList[i] = {
          "time": getTimeNormal(res.data.list[i].begin_time, res.data.list[i].end_time),
          "unitPrice": res.data.list[i].price_per_unit,
          "cappedPrice": res.data.list[i].capped_price,
          "unit": res.data.list[i].unit == 1 ? "小时" : "分钟"
        }
      }
     // success
    },
    fail: function () {
      // fail
    },
    complete: function () {
    
      var s=newList
        console.log(s)
      return s// complete
    }
  })
  
}
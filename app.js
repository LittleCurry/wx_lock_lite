//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    wx.getSystemInfo({
      success: function(res) {
        // success
        // console.log('APP设备信息：',res)
      }
    })
  }
})
//mine.js
var util = require('../../utils/util.js')
Page({
  data: {
    balance: '',
    avatarUrl:'',
    nickName:''
     },
  onLoad: function () {
  
  },
  onShow: function () {
    var that = this
    wx.request({
      url: 'https://wx.iguiyu.com/parking/my/info',
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Session': wx.getStorageSync('Session')
      }, // 设置请求的 header
      success: function (res) {
        // success
        // console.log('余额：', res)
        that.setData({
          balance: res.data.Money.toFixed(2)
        })
      },
      fail: function () {
        // fail
        that.setData({
          balance: 0.00
        })
      },
    })
    wx.getUserInfo({
    success: function(res) {
      console.log('load_in1',res)
      var userInfo = res.userInfo
      that.setData({
        avatarUrl:userInfo.avatarUrl,
        nickName:userInfo.nickName
         })
       }
  })
 
  }

})

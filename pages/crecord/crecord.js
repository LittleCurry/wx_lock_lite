// pages/crecord/crecord.js
var util = require('../../utils/util.js')
Page({
  data: {
    cRecordList: [],
    newlist: [],
    step: 1
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // console.log('bbbbbbbbb',util.getTime(16)) 
    var that = this
    wx.request({
      url: 'https://wx.iguiyu.com/parking/recharge/history',
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: util.getHeader(),  // 设置请求的 header
      success: function (res) {
        // success
        // console.log('充值记录：', res)
        if (res.data.list) {
          var newList = new Array()
          newList = res.data.list
          for (var i = 0; i < res.data.list.length; i++) {
            newList[i] = {
              "money": res.data.list[i].money.toFixed(2),
              "time": util.formatTime(res.data.list[i].payTime)
            }
          }
          that.setData({
            cRecordList: newList,
            step: 1
          })
          // console.log(newList)
         
        } else {
          that.setData({
            step: 0
          })
        }

      },
      fail: function () {
        // fail
      },
    })
  },
  onReady: function () {
    // 页面渲染完成
    wx.getSystemInfo({
      success: function (res) {
        // success
        // console.log('获取设备信息：', res)
      }
    })
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }

})
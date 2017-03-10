// pages/precord/precord.js
var util = require('../../utils/util.js')
Page({
  data: {
    parkList: [],
    step: 1
  },
  onLoad: function () {
    var that = this
    wx.request({
      url: 'https://wx.iguiyu.com/parking/park/history',
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: util.getHeader(), // 设置请求的 header
      success: function (res) {
        if (res.data.list) {
          if (res.data.list[0].endTime) {
            var newList = new Array()
            for (var i = 0; i < res.data.list.length; i++) {
              newList[i] = {
                "money": res.data.list[i].money.toFixed(2),
                "beginTime": util.transTime(res.data.list[i].beginTime),
                "endTime": util.transTime(res.data.list[i].endTime),
                "time": util.getTime(res.data.list[i].endTime - res.data.list[i].beginTime)
              }
              // console.log(newList)
            }
            that.setData({
              parkList: newList,
              step: 1
            })
          } else {
            var newList = new Array()
            for (var i = 0; i < res.data.list.length - 1; i++) {
              var j = i + 1
              newList[i] = {
                "money": res.data.list[j].money.toFixed(2),
                "beginTime": util.transTime(res.data.list[j].beginTime),
                "endTime": util.transTime(res.data.list[j].endTime),
                "time": util.getTime(res.data.list[j].endTime - res.data.list[j].beginTime)
              }
              // console.log(newList)
            }
            that.setData({
              parkList: newList,
              step: 1
            })
          }
        } else {
          step: 0
        }
        // console.log(res, '停车记录返回值') // success
      },
      fail: function () {
        // fail
      },
    })// 页面初始化 options为页面跳转所带来的参数
  },
  onShow: function () {
    var that = this
    wx.request({
      url: 'https://wx.iguiyu.com/parking/park/history',
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: util.getHeader(), // 设置请求的 header
      success: function (res) {
        if (res.data.list) {
          if (res.data.list[0].endTime) {
            var newList = new Array()
            for (var i = 0; i < res.data.list.length; i++) {
              newList[i] = {
                "money": res.data.list[i].money.toFixed(2),
                "beginTime": util.transTime(res.data.list[i].beginTime),
                "endTime": util.transTime(res.data.list[i].endTime),
                "time": util.getTime(res.data.list[i].endTime - res.data.list[i].beginTime)
              }
              // console.log(newList)
            }
            that.setData({
              parkList: newList,
              step: 1
            })
          } else {
            var newList = new Array()
            for (var i = 0; i < res.data.list.length - 1; i++) {
              var j = i + 1
              newList[i] = {
                "money": res.data.list[j].money.toFixed(2),
                "beginTime": util.transTime(res.data.list[j].beginTime),
                "endTime": util.transTime(res.data.list[j].endTime),
                "time": util.getTime(res.data.list[j].endTime - res.data.list[j].beginTime)
              }
              // console.log(newList)
            }
            that.setData({
              parkList: newList,
              step: 1
            })
          }
        } else {
          step: 0
        }
        // console.log(res, '停车记录返回值') // success
      },
      fail: function () {
        // fail
      },
    })// 页面显示
  }
}) 
var util = require('../../utils/util.js')
var money = 100
Page({
    data: {
        balance: '',
        chargeMoney: 100,
        isSelect: [{ id: 100, select: true }, { id: 50, select: false }, { id: 20, select: false }]
    },
    onLoad: function (res) {
        // console.log(res.name)
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
    },
    //选择充值金额改变监听方法
    changeMoney: function (e) {
        // console.log('Jerry === ', e.target.id)
        var id = e.target.id
        money = id
        this.setData({
            isSelect: [{ id: 100, select: id == 100 ? true : false },
            { id: 50, select: id == 50 ? true : false },
            { id: 20, select: id == 20 ? true : false }],
            chargeMoney: id
        })
    },
    toCharge: function () {
        // console.log('aaaaa', e)
        var that = this
        wx.showModal({
            title: '确认充值金额',
            content: '确认充值 ' + money + ' 元？',
            success: function (res) {
                if (res.confirm) {
                    // console.log('确认充值')
                    // var timestamp = new Date().getTime().toString().substring(0, 10)
                    // var noncestr = util.randomString(16)
                    // console.log('timeStamp: ', timestamp)
                    // console.log('nonceStr: ', noncestr)
                    // console.log('money:', money)
                    wx.request({
                        url: 'https://wx.iguiyu.com/parking/recharge?money=' + money * 100,
                        header: {
                            'Session': wx.getStorageSync('Session')
                        },
                        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                        // header: {}, // 设置请求的 header
                        success: function (res) {
                            // success
                            // console.log('========', res)

                            //微信支付
                            wx.requestPayment({
                                timeStamp: res.data.timeStamp,
                                nonceStr: res.data.nonceStr,
                                package: res.data.package,
                                signType: res.data.signType,
                                paySign: res.data.sign,
                                success: function (res) {
                                    // success
                                    // console.log('成功：', res)
                                    wx.showModal({
                                        title: '充值成功',
                                        content: '充值成功：' + money + ' 元',
                                        showCancel: false,
                                        success: function (res) {
                                            if (res.confirm) {
                                                // console.log('用户点击确定')

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
                                            }
                                        }
                                    })
                                },
                                fail: function () {
                                    // fail
                                    wx.showModal({
                                        title: '充值失败',
                                        showCancel: false
                                    })
                                },
                            })
                        },
                        fail: function () {
                            // fail
                        },
                    })
                }
            }
        })
    }
})
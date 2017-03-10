//index.js
//获取应用实例
var util = require('../../utils/util.js')
var config = require('../../configs/config.js')
var app = getApp()
var short_id, locker_id
var parking_time, time_clock, refresh_money//parking_time:停车时间；time_clock:计时器；refresh_money:价格更新计时器
var delay1, delay2, delay3, delay4
var load_in = false//根据是否走load

Page({
  data: {
    form_id: 'lionel',
    userInfo: {},
    feelist: [],
    step: 0,
    state: '0分钟0秒',
    money: '0.00',   //停车状态
    modalHidden: true,
    hidden: true,
    disabled: true,
    src: '/image/goto-unable.png',
    input_value: '',
    modal: 0
  },
  onLoad: function (e) {
    // console.log(e, "扫码获得地址￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥")
    // console.log("111￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥")
    // console.log('扫码得到锁id：', e)
    var that = this
    locker_id = e.id
    load_in = true
    //登录请求
    console.log('load_in1', load_in)
    if (load_in) {
      wx.login({
        success: function (res) {// success
          wx.request({
            url: 'https://wx.iguiyu.com/parking/login/code/' + res.code,
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT   
            success: function (res) {
              wx.setStorageSync("Session", res.data.Session)
              load_in = false
            
              //需要做该账户下是否已停车的判断 // success
              wx.request({
                url: 'https://wx.iguiyu.com/parking/park/check',
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: util.getHeader(),
                success: function (s) {
                  // success
                  //console.log('是否停车结果42：', s)
                  if (s.statusCode != 406) {
                    clearTimeout(delay1)
                    clearTimeout(delay2)
                    parking_time = s.data.endTime - s.data.beginTime
                    that.setData({
                      money: s.data.money.toFixed(2),
                      state: util.getTime(parking_time),
                      step: 2
                    })
                    time_clock = setInterval(function () {
                      parking_time++;
                      that.setData({
                        state: util.getTime(parking_time)
                      })
                    }, 1000)
                    var count_time = (60 - parking_time % 60) * 1000
                    console.log(count_time)
                    delay1 = setTimeout(function () {
                      clearInterval(time_clock)
                      wx.request({
                        url: 'https://wx.iguiyu.com/parking/park/check',
                        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                        header: util.getHeader(), // 设置请求的 header
                        success: function (res) {
                          parking_time = res.data.endTime - res.data.beginTime
                          time_clock = setInterval(function () {
                            parking_time++;
                            that.setData({
                              state: util.getTime(parking_time)
                            })
                          }, 1000)
                          console.log('check', res)
                          that.setData({
                            money: res.data.money.toFixed(2),
                            state: util.getTime(parking_time),
                          })
                        },
                        fail: function () {
                          that.setData({
                            form_id: "error"
                          })// fail
                        },
                        complete: function () {
                        }
                      })
                    }, count_time + 1000)
                    delay2 = setTimeout(function () {
                      //每隔1分钟获取一次价格
                      refresh_money = setInterval(function () {
                        clearInterval(time_clock)
                        clearInterval(parking_time)
                        count_time = 60000
                        console.log(count_time)
                        wx.request({
                          url: 'https://wx.iguiyu.com/parking/park/check',
                          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                          header: util.getHeader(), // 设置请求的 header
                          success: function (res) {
                            parking_time = res.data.endTime - res.data.beginTime
                            time_clock = setInterval(function () {
                              parking_time++;
                              console.log('yes-set')
                              that.setData({
                                state: util.getTime(parking_time)
                              })
                            }, 1000)
                            console.log('check', res)
                            that.setData({
                              money: res.data.money.toFixed(2),
                              state: util.getTime(parking_time),
                            })
                          },
                          fail: function () {
                            that.setData({
                              form_id: "error"
                            })// fail
                          },
                          complete: function () {
                          }
                        })
                      }, 60000)
                    }, count_time + 1000)
                  } else {
                    //判断扫码进入
                    if (locker_id) {
                      wx.request({
                        url: 'https://wx.iguiyu.com/parking/locker/id/' + locker_id,
                        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                        header: util.getHeader(), // 设置请求的 header
                        success: function (res) {
                          console.log(res, "suo")
                          if (res.data.status == 10) {
                            //将id转为short_id// success
                            short_id = res.data.short_id
                            var newList = new Array();
                            wx.request({
                              url: 'https://wx.iguiyu.com/parking/getPrice/short_id/' + short_id,
                              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                              header: util.getHeader(),
                              success: function (res) {
                                //获取报价表// success
                                newList = res.data.list
                                for (var i = 0; i < res.data.list.length; i++) {
                                  newList[i] = {
                                    "time": util.getTimeNormal(res.data.list[i].begin_time, res.data.list[i].end_time),
                                    "unitPrice": res.data.list[i].price_per_unit,
                                    "cappedPrice": res.data.list[i].capped_price,
                                    "unit": res.data.list[i].unit == 1 ? "小时" : "分钟"
                                  }
                                }
                                that.setData({
                                  short_id: short_id,
                                  feelist: newList,
                                  step: 1
                                })
                              },
                              fail: function () {
                                // fail
                                that.setData({
                                  form_id: "error"
                                })
                              }
                            })
                          } else {
                            that.setData({
                              hidden: true,
                            })
                            locker_id = ""
                            short_id = ""
                            wx.showModal({
                              title: config.getConfig().locker.lockerStatus[res.data.status],
                              showCancel: false,
                              success: function (res) {
                                that.setData({
                                  input_value: '',
                                  disabled: true,
                                  src: '/image/goto-unable.png',
                                  short_id: ''
                                })
                              }
                            })
                          }

                        },
                        fail: function () {
                          // fail
                          that.setData({
                            form_id: "error"
                          })
                        },
                        complete: function () {
                          // complete
                        }
                      })

                    }
                  }
                },
                fail: function () {
                  // fail
                  that.setData({
                    form_id: "error"
                  })
                },
              })
            },
            complete: function () {

            }
          })
        }
      })
    }

  },
  onShow: function (e) {
    var that = this
    //console.log('Keys100:', wx.getStorageSync('Session'))
    // console.log('id:', locker_id)
    // 检查是否已停车
    console.log('load_in1', load_in)
    if (!load_in) {
      wx.request({
        url: 'https://wx.iguiyu.com/parking/park/check',
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: util.getHeader(),// 设置请求的 header
        success: function (res) {
          if (res.statusCode != 406) {
            parking_time = res.data.endTime - res.data.beginTime
            that.setData({
              money: res.data.money.toFixed(2),
              state: util.getTime(parking_time),
              step: 2
            })
            time_clock = setInterval(function () {
              parking_time++;
              that.setData({
                state: util.getTime(parking_time)
              })
            }, 1000)
            var count_time = (60 - parking_time % 60) * 1000
            console.log(count_time)
            delay1 = setTimeout(function () {
              clearInterval(time_clock)
              wx.request({
                url: 'https://wx.iguiyu.com/parking/park/check',
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: util.getHeader(), // 设置请求的 header
                success: function (res) {
                  parking_time = res.data.endTime - res.data.beginTime
                  time_clock = setInterval(function () {
                    parking_time++;
                    that.setData({
                      state: util.getTime(parking_time)
                    })
                  }, 1000)
                  console.log('check', res)
                  that.setData({
                    money: res.data.money.toFixed(2),
                    state: util.getTime(parking_time),
                  })
                },
                fail: function () {
                  that.setData({
                    form_id: "error"
                  })// fail
                },
                complete: function () {
                }
              })
            }, count_time + 1000)
            delay2 = setTimeout(function () {
              //每隔1分钟获取一次价格
              refresh_money = setInterval(function () {
                clearInterval(time_clock)
                clearInterval(parking_time)
                count_time = 60000
                console.log(count_time)
                wx.request({
                  url: 'https://wx.iguiyu.com/parking/park/check',
                  method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                  header: util.getHeader(), // 设置请求的 header
                  success: function (res) {
                    parking_time = res.data.endTime - res.data.beginTime
                    time_clock = setInterval(function () {
                      parking_time++;
                      console.log('yes-set')
                      that.setData({
                        state: util.getTime(parking_time)
                      })
                    }, 1000)
                    console.log('check', res)
                    that.setData({
                      money: res.data.money.toFixed(2),
                      state: util.getTime(parking_time),
                    })
                  },
                  fail: function () {
                    that.setData({
                      form_id: "error"
                    })// fail
                  },
                  complete: function () {
                  }
                })
              }, 60000)
            }, count_time + 1000)
          } else {
            //判断是否通过扫码进入小程序
            if (locker_id) {
              wx.request({
                url: 'https://wx.iguiyu.com/parking/locker/id/' + locker_id,
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: util.getHeader(), // 设置请求的 header
                success: function (res) {
                  //将id转为short_id// success
                  if (res.data.status == 10) {
                    console.log('asdfasdfasdf')
                    short_id = res.data.short_id
                    var newList = new Array()
                    wx.request({
                      url: 'https://wx.iguiyu.com/parking/getPrice/short_id/' + short_id,
                      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                      header: util.getHeader(),
                      success: function (res) {
                        //获取报价表// success
                        // console.log('show:====120:', res)
                        newList = res.data.list
                        for (var i = 0; i < res.data.list.length; i++) {
                          newList[i] = {
                            "time": util.getTimeNormal(res.data.list[i].begin_time, res.data.list[i].end_time),
                            "unitPrice": res.data.list[i].price_per_unit,
                            "cappedPrice": res.data.list[i].capped_price,
                            "unit": res.data.list[i].unit == 1 ? "小时" : "分钟"
                          }
                        }
                        that.setData({
                          short_id: short_id,
                          feelist: newList,
                          step: 1
                        })
                      },
                      fail: function () {
                        // fail
                        that.setData({
                          form_id: "error"
                        })
                      }
                    })
                  } else {
                    that.setData({
                      hidden: true,
                    })
                    locker_id = ""
                    short_id = ""
                    wx.showModal({
                      title: config.getConfig().locker.lockerStatus[res.data.status],
                      showCancel: false,
                      success: function (res) {
                        that.setData({
                          input_value: '',
                          disabled: true,
                          src: '/image/goto-unable.png',
                          short_id: ''
                        })
                      }
                    })
                  }

                },
                fail: function () {
                  that.setData({
                    form_id: "error"
                  })// fail
                },
                complete: function () {
                  // complete
                }
              })

            }
          }// success
        },
        fail: function () {
          that.setData({
            form_id: "error"
          })// fail
        },
      })
    }


  },
  onHide: function () {
    var that = this
    clearInterval(time_clock)
    clearInterval(refresh_money)
    clearTimeout(delay1)
    clearTimeout(delay2)
    clearTimeout(delay3)
    clearTimeout(delay4)
    console.log("推出")
    that.setData({
      input_value: '',
      disabled: true,
      src: '/image/goto-unable.png',
      short_id: ''
    })
  },
  //输入锁号提交方法
  shortIdSubmit: function (e) {
    var that = this
    short_id = e.detail.value.shortId
    var newList = new Array()
    // console.log('ShortId：', short_id)
    if (e.detail.value.shortId) {
      that.setData({
        hidden: false
      })
      wx.request({
        url: 'https://wx.iguiyu.com/parking/getPrice/short_id/' + short_id,
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: util.getHeader(),
        success: function (res) {
          // console.log('輸入框數據179：', e.detail.value.shortId)
          //获取报价表// success
          // console.log('锁号获取数据181：', res)
          if (res.statusCode != 406) {
            that.setData({
              input_value: '',
              disabled: true,
              src: '/image/goto-unable.png',
            })
            newList = res.data.list
            wx.request({
              url: 'https://wx.iguiyu.com/parking/locker/short_id/' + short_id,
              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
              header: util.getHeader(),// 设置请求的 header
              success: function (s) {
                // console.log('188锁状态', s)
                if (s.data.status == 10) {
                  console.log(s.data.status, "所状态")
                  for (var i = 0; i < res.data.list.length; i++) {
                    newList[i] = {
                      "time": util.getTimeNormal(res.data.list[i].begin_time, res.data.list[i].end_time),
                      "unitPrice": res.data.list[i].price_per_unit,
                      "cappedPrice": res.data.list[i].capped_price,
                      "unit": res.data.list[i].unit == 1 ? "小时" : "分钟"
                    }
                  }
                  that.setData({
                    short_id: short_id,
                    feelist: newList,
                    step: 1,
                    hidden: true
                  })
                } else {
                  that.setData({
                    hidden: true,
                  })
                  wx.showModal({
                    title: config.getConfig().locker.lockerStatus[s.data.status],
                    showCancel: false,
                    success: function (res) {
                      that.setData({
                        input_value: '',
                        disabled: true,
                        src: '/image/goto-unable.png',
                      })
                    }
                  })
                }// success
              },
              fail: function () {
                that.setData({
                  form_id: "error"
                }) // fail
              },
            })
          } else {
            that.setData({
              hidden: true,
            })
            wx.showModal({
              title: res.data.msg,
              showCancel: false,
              success: function (res) {
                that.setData({
                  input_value: '',
                  disabled: true,
                  src: '/image/goto-unable.png',
                })
              }
            })
          }
        },
        fail: function () {
          // fail
          that.setData({
            form_id: "error"
          })
        }
      })

    } else {
      //  锁号获取异常
      wx.showModal({
        title: '请输入锁号！',
        showCancel: false,
        success: function (res) {

        }
      })
    }
  },

  //点击扫码事件
  saoMa: function () {
    var that = this
    var newList = new Array()
    wx.scanCode({
      success: function (res) {
        console.log('二维码Path ：', res.path)
        console.log('返回参数：', util.getPathParams(res.path))
        locker_id = util.getPathParams(res.path).id
        // console.log('二维码Path ：', res.path)
        // console.log('返回参数：', util.getPathParams(res.path))
        wx.request({
          url: 'https://wx.iguiyu.com/parking/locker/id/' + locker_id,
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: util.getHeader(),// 设置请求的 header
          success: function (res) {
            console.log('此时short_id:', res)
            that.setData({
              input_value: '',
              disabled: true,
              src: '/image/goto-unable.png',
              short_id: ''
            })
            if (res.data.status == 10) {
              //将id转为short_id// success
              short_id = res.data.short_id// success
              wx.request({
                url: 'https://wx.iguiyu.com/parking/getPrice/short_id/' + short_id,
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: util.getHeader(),
                success: function (res) {
                  //获取报价表// success
                  // console.log('锁号获取数据：', res)
                  newList = res.data.list
                  for (var i = 0; i < res.data.list.length; i++) {
                    newList[i] = {
                      "time": util.getTimeNormal(res.data.list[i].begin_time, res.data.list[i].end_time),
                      "unitPrice": res.data.list[i].price_per_unit,
                      "cappedPrice": res.data.list[i].capped_price,
                      "unit": res.data.list[i].unit == 1 ? "小时" : "分钟"
                    }
                  }
                  that.setData({
                    short_id: short_id,
                    feelist: newList,
                    step: 1
                  })
                },
                fail: function () {
                  // fail
                  that.setData({
                    form_id: "error"
                  })
                }
              })
            } else {
              that.setData({
                hidden: true,
              })
              locker_id = ""
              short_id = ""
              wx.showModal({
                title: config.getConfig().locker.lockerStatus[res.data.status],
                showCancel: false,
                success: function (res) {
                  that.setData({
                    input_value: '',
                    disabled: true,
                    src: '/image/goto-unable.png',
                    short_id: ''
                  })
                }
              })
            }

          },
          fail: function () {
            that.setData({
              form_id: "error"
            })// fail
          },
          complete: function () {
            // complete
          }
        })

      },
      fail: function () {
        that.setData({
          form_id: "error"
        }) // fail
      }
    })
  },
  //点击请落锁，我要停车
  confirmParking: function (e) {
    var that = this
    // console.log('formid #####', e.detail.formId)
    that.setData({
      hidden: false
    })
    wx.request({
      url: 'https://wx.iguiyu.com/parking/park/short_id/' + short_id,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: util.getHeader(),
      success: function (res) {
        // success
        // console.log("点停车按钮后285：", res)
        if (res.statusCode == 200) {
          clearTimeout(delay3)
          clearTimeout(delay4)
          delay3 = setTimeout(function () {
            clearInterval(time_clock)
            wx.request({
              url: 'https://wx.iguiyu.com/parking/park/check',
              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
              header: util.getHeader(), // 设置请求的 header
              success: function (res) {
                parking_time = res.data.endTime - res.data.beginTime
                time_clock = setInterval(function () {
                  parking_time++;
                  that.setData({
                    state: util.getTime(parking_time)
                  })
                }, 1000)
                that.setData({
                  money: res.data.money.toFixed(2),
                  state: util.getTime(parking_time),
                })
              },
              fail: function () {
                that.setData({
                  form_id: "error"
                })// fail
              },
              complete: function () {
              }
            })
          }, 1000)
          that.setData({
            step: 2,
            hidden: true
          })
          delay4 = setTimeout(function () {
            //每隔1分钟获取一次价格
            refresh_money = setInterval(function () {
              clearInterval(time_clock)
              wx.request({
                url: 'https://wx.iguiyu.com/parking/park/check',
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: util.getHeader(), // 设置请求的 header
                success: function (res) {
                  parking_time = res.data.endTime - res.data.beginTime
                  time_clock = setInterval(function () {
                    parking_time++;
                    console.log('yes')
                    that.setData({
                      state: util.getTime(parking_time)
                    })
                  }, 1000)
                  console.log('check', res)
                  that.setData({
                    money: res.data.money.toFixed(2),
                    state: util.getTime(parking_time),
                  })
                },
                fail: function () {
                  that.setData({
                    form_id: "error"
                  })// fail
                },
                complete: function () {
                }
              })
            }, 60000)
          }, 1000)
          wx.request({
            url: 'https://wx.iguiyu.com/parking/park/message',
            data: {
              'id': res.data.id,
              'message_id': e.detail.formId
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: util.getHeader({ 'content-type': 'application/x-www-form-urlencoded' }),// 设置请求的 header
            success: function (res) {
              //停车成功推送微信消息 // success
            },
            fail: function () {
              that.setData({
                form_id: "error"
              }) // fail
            },
          })
        }
        if (res.statusCode == 406) {  //余额不足
          wx.showModal({
            title: '余额不足，请充值！',
            showCancel: false,
            confirmText: '充值',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/charge/charge',
                  success: function (res) {
                    // success
                  }
                })
              }
            }
          })
        }
      },
      fail: function () {
        // fail
        that.setData({
          form_id: "error"
        })
      }
    })
  },
  //结束停车按钮
  stopParking: function () {
    var that = this
    that.setData({
      modal: 1
    })

   
    
    
  },
  //確認離開
  checkLeave: function () {
     var that = this
    that.setData({
      modal: 0
    })
      //停车结束请求
      // console.log("用户确认点击了结束停车327")
      clearInterval(time_clock)
      clearInterval(refresh_money)
      clearTimeout(delay1)
      clearTimeout(delay2)
      clearTimeout(delay3)
      clearTimeout(delay4)
      that.setData({
        hidden: false
      })
      //獲取價格
      wx.request({
        url: 'https://wx.iguiyu.com/parking/park/check',
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: util.getHeader(),// 设置请求的 header
        success: function (res) {
          if (res.data.money) {
            parking_time = res.data.endTime - res.data.beginTime
            that.setData({
              money: res.data.money.toFixed(2),
              state: util.getTime(parking_time)
            })
          }// success
        },
        fail: function () {
          that.setData({
            form_id: "error"
          })// fail
        },
      })
      //停車成功
      wx.request({
        url: 'https://wx.iguiyu.com/parking/leave',
        data: {
          'short_id': short_id
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: util.getHeader(),// header: {}, // 设置请求的 header
        success: function (res) {
          //停车成功// success
          short_id = ""
          locker_id = ""
          that.setData({
            hidden: true,
            step: 3
          })
          // console.log(res)
        }
      })
  },
  //取消離開
  cancelLeave: function () {
     var that = this
    that.setData({
      modal: 0
    })
    
  },
  //确定输入框有值
  checkContent: function (e) {
    var that = this
    if (e.detail.value) {
      that.setData({
        disabled: false,
        src: '/image/goto.png'
      })
    } else {
      that.setData({
        disabled: true,
        src: '/image/goto-unable.png',
        btn_type: 'defalut'
      })
    }
  },
  //返回首页，重置short_id
  backHome: function () {
    var that = this
    that.setData({
      money: '0.00',
      state: '0分钟0秒',
      step: 0,
      hidden: true,
    })
    short_id = ""
    locker_id = ""
    // console.log("short_id為===", short_id)
  },
  onShareAppMessage: function () {
    return {
      title: '鲑鱼出行',
      path: '/pages/index/index'
    }
  },
  changeLocker: function () {
    var that = this
    that.setData({
      step: 0,
      feelist: [],
      short_id: ''
    })
    short_id = ""
    locker_id = ""
  }

})

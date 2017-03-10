module.exports = {
    getConfig: getConfig
}
var config = {
    locker: {
        lockerStatus: {
            10: "空车",
            21: "被预定",
            22: "被占用",
            31: "异常",
            32: "已坏"
        }
    }

}

function getConfig() {
    return config
}
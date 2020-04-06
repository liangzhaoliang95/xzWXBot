async function onScan(qrcode, status){
    require('qrcode-terminal').generate(qrcode,{ small: true })
    const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
    ].join('');
    console.log(`${new Date()}:机器人扫码登录`)
    console.log(qrcodeImageUrl)
}
module.exports = {
    onScan
}
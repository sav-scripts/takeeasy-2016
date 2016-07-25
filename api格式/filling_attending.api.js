/**
 * 紀錄參加填空活動的使用者資料
 *
 */


/*** 前端送出 ***/
var send =
{
    "name": "John Tester", // 使用者真實姓名
    "phone": "0987654321", // 使用者手機
    "email": "someone@some.where", // 使用者email

    "fb_uid": "231356646542", // facebook uid
    "fb_token": "asdf89f79asfsdf678asf0sadfasf", // facebook access token

    "image_data": "somebase64string" // image data, base 64 string, jpeg 格式, 已去除開頭 "data:image/jpeg;base64," 字串, 尺寸 600 x 315
};


/* 後端回應 */
var response =
{
    "error": "some error",  // 正常執行的話傳回空值, 有錯傳回錯誤訊息 (除非我們協定過的特殊錯誤, 不然此訊息會直接 alert 給使用者)
    "share_url": "http://xxx.xxx/xx.jpg" // 傳回作品分享圖片網址 (由 request 的 image_data 生成)
};
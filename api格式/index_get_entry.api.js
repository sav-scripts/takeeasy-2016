/*
 * 取得作品資料, 提供首頁輪播
 */


/* 前端送出 */
var send =
{
    "serial": "321" // 一組作品的唯一編號, 供後端篩選不重複的作品, 若給空值的話, 請隨機傳回一筆資料
};


/* 後端回應 */
var response =
{
    "error": "some error",  // 正常執行的話傳回空值, 有錯傳回錯誤訊息
    "serial": "0322", // 作品流水號
    "name": "John Tester", // 投稿作者名稱
    "thumb_url": "http://xxx.xxx.xx/xx.jpg" // 作品縮圖網址 (尺寸 133 x 100)
};
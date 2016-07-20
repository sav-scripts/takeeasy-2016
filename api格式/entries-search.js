/*
 * 搜尋已經上架作品資料
 */


/* 前端送出 */
var send =
{
    "keyword": "John Tester", // 搜尋關鍵字, 依據 search_type 做不同搜尋, 空值的話就當搜尋所有作品處理
    "search_type": "user_name", // 搜尋方式, 有兩種: user_name => 投稿者名稱, serial => 作品流水號
    "sort_type": "date", // 排序方式, 有兩種: date => 依投稿日期, votes => 投票數量
    "page_index": 0,
    "page_size": 10
};


/* 後端回應 */
var response =
{
    "error": "some error",  // 正常執行的話傳回空值, 有錯傳回錯誤訊息
    "data": // 搜尋結果 (如果是搜尋流水號的話, 資料最多只會有一筆)
    [
        {
            "serial": "0088",
            "name": "John",
            "num_votes": "31231",
            "thumb_url": "http://xxxx.xx/thumbxxx.jpg", // 作品 url (尺寸 133 x 100)
            "url":  "http://xxxx.xx/imagexxx.jpg", // 作品 url (尺寸 474 x 356)
            "description": "bablalalala" // 作品創作概念
        }
        // ...etc
    ],
    "num_pages": 12,
    "page_index": 0
};
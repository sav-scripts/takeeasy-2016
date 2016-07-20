/*
 * 搜尋已經上架作品資料
 */


/* 前端送出 */
var send =
{
    "keyword": "John Tester",
    "search_type": "user_name", // 搜尋方式, 有兩種: user_name => 投稿者名稱, serial => 作品流水號
    "sort_type": "date", // 排序方式, 有兩種: date => 依投稿日期, votes => 投票數量
    "page_index": 0
};


/* 後端回應 */
var response =
{
    "error": "some error",  // 正常執行的話傳回空值, 有錯傳回錯誤訊息
    "data":
    [
        {
            "serial": "0088",
            "name": "John"
        }
    ]
};
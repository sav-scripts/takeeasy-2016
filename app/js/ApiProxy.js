/**
 * Created by sav on 2016/7/22.
 */
(function(){

    var _fakeData =
    {
        participate:
        {
            enabled: true,
            response: {
                error: "",
                serial: "0001"
            }
        },

        entries_search:
        {
            enabled: true,
            response:{
                erro: "",
                data:[

                    {
                        "serial": "0088",
                        "name": "John",
                        "num_votes": "31231",
                        "thumb_url": "http://xxxx.xx/thumbxxx.jpg", // 作品 url (尺寸 133 x 100)
                        "url":  "http://xxxx.xx/imagexxx.jpg", // 作品 url (尺寸 474 x 356)
                        "description": "bablalalala" // 作品創作概念
                    }
                ],
                num_pages: 13,
                page_index: 3,
                num_entries: 123
            }
        }
    };

    var _apiExtension = "",
        _apiPath = "/process/";

    window.ApiProxy =
    {
        callApi: function(apiName, params, cb)
        {
            var fakeData = _fakeData[apiName];
            if(fakeData && fakeData.enabled)
            {
                var response = fakeData.response;

                if(apiName == 'entries_search')
                {
                    response.page_index = params.page_index;

                    var pageIndex = params.page_index,
                        startIndex = pageIndex * params.page_size,
                        index,
                        i;

                    for(i=0;i<params.page_size;i++)
                    {
                        index = startIndex + i;

                        response.data[i] =
                        {
                            "serial": index,
                            "name": "name " + index,
                            "num_votes": parseInt(Math.random()*3000),
                            "description": 'description ' + index,
                            "url": "./images/participate-upload-title-girl.png"
                        };

                        if(i >= (response.num_entries-1)) break;
                    }
                }

                complete(response);
            }
            else
            {
                var apiUrl = _apiPath + apiName + _apiExtension,
                    method = "POST";

                $.ajax
                ({
                    url: apiUrl,
                    type: method,
                    data: params,
                    dataType: "json"
                })
                .done(complete)
                .fail(function ()
                {
                    //alert("無法取得伺服器回應");
                    complete({error:"無法取得伺服器回應"});
                });
            }

            function complete(response)
            {
                if(cb) cb.call(null, response);
            }
        }
    };

}());
/**
 * Created by sav on 2016/7/22.
 */
(function(){

    var _fakeData =
    {
        "participate":
        {
            enabled: true,
            response: {
                error: "",
                serial: "0001"
            }
        },

        "entries_search":
        {
            enabled: true,
            response:{
                erro: "",
                data:[

                    {
                        "serial": "0088",
                        "status": "approved",
                        "name": "John",
                        "num_votes": "31231",
                        "thumb_url": "http://xxxx.xx/thumbxxx.jpg", // 作品 url (尺寸 133 x 100)
                        "url":  "http://xxxx.xx/imagexxx.jpg", // 作品 url (尺寸 474 x 356)
                        "description": "bablalalala" // 作品創作概念
                    }
                ],
                num_pages: 13,
                page_index: 3,
                page_size: 10
            }
        },
        "entries_search.serial": {

            enabled: true,
            response:{
                erro: "",
                data:[

                    {
                        "serial": "0088",
                        "status": "approved",
                        "name": "John",
                        "num_votes": "31231",
                        "thumb_url": "./images/participate-upload-title-girl.png", // 作品 url (尺寸 133 x 100)
                        "url":  "./images/participate-upload-title-girl.png", // 作品 url (尺寸 474 x 356)
                        "description": "bablalalala" // 作品創作概念
                    }
                ],
                num_pages: 1,
                page_index: 0,
                page_size: 1
            }
        },
        "entries_search.single": {

            enabled: true,
            response:{
                erro: "",
                data:[

                    {
                        "serial": "7354",
                        "status": "approved",
                        "name": "John",
                        "num_votes": "6945",
                        "thumb_url": "./images/participate-upload-title-girl.png", // 作品 url (尺寸 133 x 100)
                        "url":  "./images/participate-upload-title-girl.png", // 作品 url (尺寸 474 x 356)
                        "description": "bablalalala" // 作品創作概念
                    }
                ],
                num_pages: 123,
                page_index: 0,
                page_size: 1
            }
        }
    };

    var _apiExtension = "",
        _apiPath = "/process/";

    window.ApiProxy =
    {
        callApi: function(apiName, params, fakeDataName, cb)
        {
            if(fakeDataName)
            {
                if(fakeDataName === true) fakeDataName = apiName;

                var fakeData = _fakeData[fakeDataName],
                    response = fakeData.response;

                if(fakeDataName == 'entries_search')
                {
                    response.page_index = params.page_index;
                    response.data = [];

                    var pageIndex = params.page_index,
                        startIndex = pageIndex * params.page_size,
                        index,
                        numEntries = 123,
                        i;

                    for(i=0;i<params.page_size;i++)
                    {
                        index = startIndex + i;

                        response.data.push
                        ({
                            "serial": index,
                            "name": "name " + index,
                            "num_votes": parseInt(Math.random()*3000),
                            "description": 'description ' + index,
                            "thumb_url": "./images/participate-upload-title-girl.png",
                            "url": "./images/participate-upload-title-girl.png"
                        });

                        if(index >= (numEntries-1)) break;
                    }
                }
                else if(fakeDataName == 'entries_search.single')
                {
                    response.page_index = params.page_index;
                    response.data[0].serial = response.page_index;
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
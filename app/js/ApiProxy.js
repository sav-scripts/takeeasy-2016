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
                "error": "",
                "serial": "0001"
            }
        }
    };

    var _apiExtension = ".php",
        _apiPath = "./api/";

    window.ApiProxy =
    {
        callApi: function(apiName, params, cb)
        {
            var fakeData = _fakeData[apiName];
            if(fakeData && fakeData.enabled)
            {
                complete(fakeData.response);
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
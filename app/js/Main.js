(function(){

    "use strict";
    var self = window.Main =
    {
        localSettings:
        {
            fb_appid: "153719541717801"
        },
        settings:
        {
            isLocal: false,
            isMobile: false,

            fb_appid: "153715675051521",
            fbPermissions: [],

            fbToken: null,
            fbUid: null,

            isiOS: false
        },
        init: function()
        {
            if( window.location.host == "local.savorks.com" || window.location.host == "socket.savorks.com")
            {
                $.extend(self.settings, self.localSettings);
                Main.settings.isLocal = true;
            }

            if(Utility.urlParams.state)
            {
                var length = history.length;
                history.go(-length);

                window.location.replace(Utility.getPath() + "#" + Utility.urlParams.state);
                //SceneHandler.setHash(Utility.urlParams.state, false);
            }

            self.settings.isiOS = Utility.isiOS();

            //self.settings.isiOS = true;

            var version = Utility.urlParams.nocache == '1'? new Date().getTime(): "0";

            var hashArray =
            [
                "/Index",
                "/Participate",
                "/Rule"
            ],
             blockHashs =
            [
                //"/ParticipateForm"
            ];

            CommonForm.init();
            EntryView.init();

            Menu.init();

            //EntryView.show();
            //Loading.hide();


            FBHelper.init(Main.settings.fb_appid, function()
            {

                FBHelper.checkLoginStatus(Main.settings.fbPermissions, function(error, authResponse)
                {
                    if(error == null)
                    {
                        Main.settings.fbToken = authResponse.accessToken;
                        Main.settings.fbUid = authResponse.userID;
                        startApp();
                    }
                    else
                    {
                        startApp();
                    }
                });

                //startApp();

                function startApp()
                {
                    SceneHandler.init(hashArray,
                        {
                            blockHashs: blockHashs,
                            listeningHashChange: true,
                            version: version,

                            cbBeforeChange: function()
                            {
                            },
                            cbContentChange: function(hashName)
                            {
                            },
                            hashChangeTester: function(hashName)
                            {
                                if(hashName == '/Participate')
                                {
                                    if(!Main.settings.fbToken)
                                    {
                                        console.log("no token");
                                        hashName = null; // cancel content change
                                        SceneHandler.setHash("/Index");
                                    }
                                }

                                return hashName;
                            }
                        });


                    SceneHandler.toFirstHash();
                }

            });


            //SceneHandler.toFirstHash();

            $(window).on("resize", onResize);
            onResize();
        },

        loginFB: doLogin
    };

    function doLogin(targetHash, cb)
    {
        if(!targetHash) targetHash = "/Index";

        Loading.progress("登入 Facebook 中...請稍候").show();

        if(Main.settings.fbUid)
        {
            complete();
        }
        else
        {
            //if(true)
            //if(Main.settings.isMobile)
            if(Main.settings.isiOS)
            {
                FB.getLoginStatus(function(response)
                {
                    if (response.status === 'connected')
                    {
                        //checkPermissions(response.authResponse, true);
                        complete(response.authResponse);
                    }
                    else
                    {
                        doRedirectLogin();
                    }
                });
            }
            else
            {
                FB.login(function(response)
                    {
                        if(response.error)
                        {
                            alert("登入 Facebook 失敗");
                        }
                        else if(response.authResponse)
                        {
                            //checkPermissions(response.authResponse, false);

                            complete(response.authResponse);

                        }
                        else
                        {
                            alert("您必須登入 Facebook 才能參加本活動");
                            Loading.hide();
                        }

                    },
                    {
                        scope: Main.settings.fbPermissions,
                        return_scopes: true,
                        auth_type: "rerequest"
                    });
            }

        }

        function checkPermissions(authResponse, redirectToLogin)
        {
            FB.api('/me/permissions', function(response)
            {
                if (response && response.data && response.data.length)
                {

                    var i, obj, permObj = {};
                    for(i=0;i<response.data.length;i++)
                    {
                        obj = response.data[i];
                        permObj[obj.permission] = obj.status;
                    }

                    if (permObj.publish_actions != 'granted')
                    {
                        fail("您必須給予發佈權限才能製作分享影片");
                    }
                    else
                    {
                        complete(authResponse);
                    }
                }
                else
                {
                    alert("fail when checking permissions");
                    Loading.hide();
                }
            });

            function fail(message)
            {
                alert(message);
                Loading.hide();
                if(redirectToLogin) doRedirectLogin();
            }
        }

        function doRedirectLogin()
        {
            var url = "https://www.facebook.com/dialog/oauth?"+
                "client_id="+Main.settings.fb_appid+
                "&scope="+Main.settings.fbPermissions.join(",")+
                "&state="+ targetHash +
                "&redirect_uri=" + encodeURI(Utility.getPath());
            window.open(url, "_self");
        }


        function complete(authResponse)
        {
            if(authResponse)
            {
                Main.settings.fbToken = authResponse.accessToken;
                Main.settings.fbUid = authResponse.userID;
            }

            Loading.hide();
            if(cb) cb.apply();
        }
    }

    function onResize()
    {
        var width = $(window).width(),
            height = $(window).height();
    }

}());

(function(){

    var _shakeTween;

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

            useFakeData: false,

            fb_appid: "153715675051521",
            fbPermissions: [],

            fbToken: null,
            fbUid: null,

            fbState: null,

            isiOS: false,
            isLineBrowser: false,

            viewport:
            {
                width: 0,
                height: 0,
                ranges: [640],
                index: -1,
                changed: false
            }
        },
        init: function()
        {
            if( window.location.host == "local.savorks.com" || window.location.host == "socket.savorks.com")
            {
                $.extend(self.settings, self.localSettings);
                Main.settings.isLocal = true;
            }

            if(Main.settings.isLocal || Utility.urlParams.usefakedata == '1') Main.settings.useFakeData = true;


            //alert(location.href);

            checkAccessToken();

            self.settings.isLineBrowser = Boolean(navigator.userAgent.match('Line'));

            self.settings.isiOS = Utility.isiOS();

            //self.settings.isiOS = true;

            //if(navigator.userAgent.match('Line'))
            //{
            //    alert('您使用的瀏覽器不支援某些功能，建議您使用其他瀏覽器瀏覽本網站.');
            //}


            var version = Utility.urlParams.nocache == '1'? new Date().getTime(): "0";

            var hashArray =
            [
                "/Index",
                "/Participate",
                "/Entries",
                "/Rule",
                "/Reviewer",
                "/Fill"
            ],
             blockHashs =
            [
                //"/ParticipateForm"
            ];



            var hashTranslate =
            {
                "/Index": "index",
                "/Participate": "parttime",
                "/Entries": "artworks",
                "/Rule": "rule",
                "/Reviewer": "artist",
                "/Fill": "copywork"
            };


            CommonForm.init();
            EntryView.init();
            RadialBackground.init();

            Menu.init();


            //EntryView.show();
            //Loading.hide();

            if(Modernizr.touchevents) Helper.precentPullToRefresh();

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
                    else if(self.settings.fbToken)
                    {
                        FB.api('/me?access_token=' + self.settings.fbToken + '', function (response)
                        {
                            if(response.id)
                            {
                                self.settings.fbUid = response.id;
                                //alert("check");
                                startApp();
                            }
                            else
                            {
                                startApp();
                            }
                        });
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
                                var popups = [EntryView, Participate.Success, Entries.VoteSuccess, Entries.Reviewing, Entries.Unapproved, Fill.Success],
                                    i;
                                for(i=0;i<popups.length;i++)
                                {
                                    popups[i].hide();
                                }


                            },
                            cbContentChange: function(hashName)
                            {
                                var pageName = hashTranslate[hashName];
                                if(pageName)
                                {
                                    ga("send", "pageview", pageName);
                                }

                            },
                            hashChangeTester: function(hashName)
                            {
                                if(hashName == '/Participate')
                                {
                                    if(self.settings.isLineBrowser)
                                    {
                                        alert('您的瀏覽器不支援上傳檔案, 請使用其他的瀏覽器瀏覽此單元');
                                        hashName = null; // cancel content change
                                        SceneHandler.setHash('/Index');

                                        return null;
                                    }
                                }

                                if(hashName == '/Participate' || hashName == '/Fill')
                                {
                                    if(!Main.settings.fbToken)
                                    {
                                        console.log("no token");
                                        hashName = null; // cancel content change
                                        SceneHandler.setHash('/Index');

                                        return null;
                                    }
                                }

                                if(hashName == '/Participate' || hashName == '/Fill')
                                {
                                    if(!Modernizr.canvas)
                                    {
                                        alert('您的瀏覽器不支援 html5 canvas, 請使用其他的瀏覽器瀏覽此單元');

                                        hashName = null; // cancel content change
                                        SceneHandler.setHash('/Index');

                                        return null;
                                    }
                                }


                                return hashName;
                            }
                        });

                    if(Utility.urlParams.serial)
                    {
                        RadialBackground.startFlash();
                        getFirstEntry();
                    }
                    else
                    {
                        var firstHash = SceneHandler.toFirstHash();

                        if(firstHash !== "/Index") RadialBackground.startFlash();
                    }
                }

            });

            //SceneHandler.toFirstHash();

            $(window).on("resize", onResize);
            onResize();
        },



        shakeScreen: function ()
        {
            if(_shakeTween) _shakeTween.kill();

            var offsetX = (Math.random()*16+16) * (Math.random()>.5? 1: -1),
                offsetY = (Math.random()*12+12) * (Math.random()>.5? 1: -1);
            var $dom = $("body");
            TweenMax.killTweensOf($dom);
            TweenMax.set($dom, {marginLeft:offsetX, marginTop:offsetY});
            TweenMax.to($dom,.7, {marginLeft:0, marginTop:0, ease:Elastic.easeOut.config(1,.2)});
        },

        loginFB: doLogin
    };

    function checkAccessToken()
    {
        if(location.href.match("access_token") && location.href.match("state"))
        {
            var string = "?" + location.href.split("#")[1];

            if(string)
            {
                self.settings.fbToken = Helper.getParameterByName("access_token", string);
                self.settings.fbState = Helper.getParameterByName("state", string);

                removeFBParams();
            }
        }
    }

    function removeFBParams()
    {
        if(history && history.replaceState)
        {
            var hash = Main.settings.fbState;
            var uri = Helper.removeURLParameter(location.href, 'code');
            uri = Helper.removeURLParameter(uri, 'state');

            var currentHash = SceneHandler.getHash();

            uri = uri.replace('?#' + currentHash, '').replace('#' + currentHash, '');

            uri += "#" + hash;

            //console.log("final uri = " + uri);
            window.history.replaceState({path: uri}, '', uri);

            //history.go(-length);
            //window.location.replace(Utility.getPath() + "#" + Utility.urlParams.state);
        }
    }



    function removeFBParams_old()
    {
        if(history && history.replaceState)
        {
            var hash = Utility.urlParams.state;
            var uri = Helper.removeURLParameter(location.href, 'code');
            uri = Helper.removeURLParameter(uri, 'state');

            uri += "#" + hash;
            window.history.replaceState({path:uri},'',uri);
        }
    }

    function getFirstEntry()
    {
        //if (history.pushState) {
        //    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?myNewUrlQuery=1';
        //    window.history.pushState({path:newurl},'',newurl);
        //}
        if(history && history.replaceState)
        {
            var hash = SceneHandler.getHash();
            var uri = Helper.removeURLParameter(location.href, 'serial') + "#" + hash;
            //window.history.pushState({path:uri},'',uri);
            window.history.replaceState({path:uri},'',uri);
        }

        //console.log("uri = " + uri);

        Entries.firstEntrySerial = Utility.urlParams.serial;
        //SceneHandler.toFirstHash();
        SceneHandler.toHash('/Entries');
    }

    function doLogin(targetHash, cb, redirectUrl)
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
            if(Main.settings.isiOS || Main.settings.isLineBrowser)
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
            var uri = redirectUrl? encodeURI(redirectUrl): encodeURI(Utility.getPath());


            var url = "https://www.facebook.com/dialog/oauth?"+
                "response_type=token"+
                "&client_id="+Main.settings.fb_appid+
                "&scope="+Main.settings.fbPermissions.join(",")+
                "&state="+ targetHash +
                "&redirect_uri=" + uri;
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

        var i,
            vp = self.settings.viewport;
        for(i=0;i<vp.ranges.length;i++)
        {
            if(vp.ranges[i] >= width) break;
        }

        var oldIndex = vp.index;

        vp.index = i;
        vp.width = width;
        vp.height = height;
        vp.changed = (oldIndex !== vp.index);

        if(SceneHandler.currentScene)
        {
            SceneHandler.currentScene.resize();
        }

        CommonForm.resize();
    }

}());



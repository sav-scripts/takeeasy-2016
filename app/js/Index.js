(function ()
{
    var $doms = {},
        _isHiding = true,
        _isLocking = false,
        _isInit = false,
        _sampleImage,
        _animeDoms = [],
        _lastQuery = null;

    window.Index =
    {
        firstEntrySerial: null,

        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(cb);
            }

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_index.html", startWeight: 0, weight: 100, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);
                    _isInit = true;



                    cb.apply(null, [true]);
                }, 0);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        resize: function (width, height, scale)
        {

        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#index");


        $doms.btnToParticipate = $doms.container.find(".button-1").on("click", function()
        {
            ga("send", "event", "index", "click", "go_parttime");

            alert("本活動已經截止 感謝您的參與");

            //Main.loginFB("/Participate", function()
            //{
            //    SceneHandler.toHash("/Participate");
            //});
        });


        $doms.btnToFill = $doms.container.find(".button-2").on("click", function()
        {
            ga("send", "event", "index", "click", "go_copywork");

            alert("本活動已經截止 感謝您的參與");

            //Main.loginFB("/Fill", function()
            //{
            //    SceneHandler.toHash("/Fill");
            //});
        });

        $doms.btnToEntries = $doms.container.find(".button-3").on("click", function()
        {
            ga("send", "event", "index", "click", "go_artworks");

            alert("本活動已經截止 感謝您的參與");

            //Main.loginFB("/Entries", function()
            //{
            //    SceneHandler.toHash("/Entries");
            //});
        });

        $doms.thumbContainer = $doms.container.find(".wrapper");

        $doms.sampleThumb = $doms.thumbContainer.find(".sample-thumb");
        $doms.sampleSerial = $doms.thumbContainer.find(".sample-serial");
        $doms.sampleAuthor = $doms.thumbContainer.find(".sample-author");

        $doms.arrowLeft = $doms.thumbContainer.find('.arrow-left').on("mousedown", function()
        {
            requestOne_2(-1);
        });
        $doms.arrowRight = $doms.thumbContainer.find('.arrow-right').on("mousedown", function()
        {
            requestOne_2(1);
        });

        requestOne_2(0);


        Helper.selectIntoArray($doms.container,
            [
                //".hand",
                ".mini-hand",
                ".title",
                ".sub-title",
                ".left-girl",
                ".right-boy",
                ".desc",
                //".hand-girl",
                ".left-mob"
            ], _animeDoms, $doms);

        $doms.hand = $doms.container.find(".hand");
        $doms.handGirl = $doms.container.find(".hand-girl");

        _animeDoms.push(
            $doms.btnToEntries,
            $doms.btnToParticipate,
            $doms.btnToFill,
            $doms.thumbContainer
        );


        $doms.container.detach();
    }

    function requestOne_2(plusCount)
    {
        if(_isLocking) return;
        _isLocking = true;

        var params =
        {
            "keyword": '',
            "search_type": "user_name",
            "status": "approved",
            "sort_type": "date",
            "page_index": 0,
            "page_size": 1
        };

        if(_lastQuery)
        {
            var index = parseInt(_lastQuery.page_index) + plusCount;
            if(index >= parseInt(_lastQuery.num_pages)) return;
            if(index < 0) return;

            params.page_index = index;
        }

        ApiProxy.callApi("entries_search", params, 'entries_search.serial', function(response)
        {
            if(response.error)
            {
                alert(response.error);
            }
            else
            {
                _lastQuery = response;
                if(response.data.length > 0)
                {
                    applyThumbData_v2();
                }
            }

        });
    }

    function applyThumbData_v2()
    {
        var dataObj = _lastQuery.data[0];

        var image = document.createElement('img');

        $(image).css("position", "absolute").css("left", 0).css("top", 0).attr("width", "100%").attr("height", "100%");


        image.onload = function()
        {
            var oldImage = _sampleImage;

            //$doms.sampleSerial.text(dataObj.serial);
            $doms.sampleSerial.text((parseInt(dataObj.serial) + 10000).toString().substr(1));
            $doms.sampleAuthor.text('作者：'+dataObj.name);

            _sampleImage = image;

            TweenMax.from(_sampleImage,.4, {opacity: 0, onComplete:function()
            {
                if(oldImage) $(oldImage).detach();
            }});
            $doms.sampleThumb.append(_sampleImage);

            _isLocking = false;
            updateArrow();
        };

        image.src = dataObj.thumb_url;
    }



    function updateArrow()
    {
        var index = parseInt(_lastQuery.page_index);

        $doms.arrowLeft.toggleClass("hidding", (index <= 0));
        $doms.arrowRight.toggleClass("hidding", (index >= (parseInt(_lastQuery.num_pages)-1)));
    }

    function show(cb)
    {
        _isHiding = false;

        $("#scene-container").append($doms.container);

        Helper.clearElementsStyles($doms.container.find("div"));

        _animeDoms = Utility.shuffleArray(_animeDoms);


        var vpIndex = Main.settings.viewport.index;

        var tl = new TimelineMax;

        var s = vpIndex == 0? .6: 1,
            s2 = vpIndex == 0? 1.2: 2.5,
            s3 = vpIndex == 0? 1.3: 1.7;
            RadialBackground.stopFlash();

        tl.set($doms.container, {autoAlpha:1});
        tl.set(_animeDoms, {autoAlpha:0});

        tl.set($doms.handGirl, {autoAlpha:0, scale:1, zIndex:1});
        tl.set($doms.hand, {marginTop: 100*s, scale:1+s, transformOrigin: "center top"});

        tl.to($doms.hand,1, {marginTop:300*s, ease:Power4.easeOut});
        tl.to($doms.hand,1.2, {marginTop:0, scale:1, ease:Elastic.easeOut});

        tl.add(function()
        {
            RadialBackground.startFlash();
            RadialBackground.boom(.5);

            Main.shakeScreen();

        }, "-=1.05");

        tl.set(_animeDoms, {autoAlpha:1}, "-=.9");
        tl.staggerFrom(_animeDoms,s3, {top:0, left:0, scale:0, transformOrigin: "center center", ease:Elastic.easeOut.config(s2, 0.3)},.01, "-=.9");

        tl.set($doms.handGirl, {autoAlpha:1}, "-=1.5");
        tl.to($doms.handGirl,.15, {marginTop: -5, marginLeft: 20, rotation: 30, autoAlpha:1, scale:1, ease:Power3.easeOut}, "-=1.5");
        tl.set($doms.handGirl, {zIndex:3}, "-=1.35");
        tl.to($doms.handGirl,.15, {marginTop: 0, marginLeft: 0, ease:Power3.easeIn, scale: 1, rotation: 0}, "-=1.35");

        tl.add(function ()
        {
            Helper.clearElementsStyles($doms.container.find("div"));
            cb.apply();
        });
    }

    function hide(cb)
    {
        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            _isHiding = true;
            $doms.container.detach();
            cb.apply();
        });
    }

}());
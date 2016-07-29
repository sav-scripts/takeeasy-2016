(function ()
{
    var $doms = {},
        _isInit = false,
        _currentStep = 'upload',
        _sendingIllust = null,
        _rawShareImage = null,
        _stepDic;

    var self = window.Fill =
    {
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
                    {url: "_fill.html", startWeight: 0, weight: 100, dom: null}
                ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    _rawShareImage = document.createElement('img');
                    _rawShareImage.onload = function()
                    {
                        build(templates);
                        _isInit = true;
                        cb.apply(null);
                    };

                    _rawShareImage.src = './misc/share.4.0.raw.jpg';


                }, 0);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        toStep: function(step, options)
        {
            if(step == _currentStep) return;

            var oldStep = _currentStep;
            _currentStep = step;

            _stepDic[oldStep].hide(0, function()
            {

                if(_currentStep == "form")
                {
                    CommonForm.setMode("fill");
                    //self.UploadStep.hide(0, CommonForm.show);

                    self.Title.toggleFormMode(true);
                }
                else
                {
                    self.Title.toggleFormMode(false);

                    if(_currentStep == "illust-list")
                    {
                        self.IllustList.toIllust((options.illustratorIndex-1)*3, 0);
                    }
                }


                _stepDic[_currentStep].show();
            });
        },

        setSendingIllust: function(illust)
        {
            _sendingIllust = illust;
        },

        getSendingCanvas: function()
        {
            if(_sendingIllust)
            {

                var illustGeom =
                {
                    x: 161*2,
                    y: 106*2,
                    width: 272*2,
                    height: 205*2
                };

                var illustCanvas = _sendingIllust.getOutputCanvas(),
                    scale = illustGeom.width / illustCanvas.width;

                //var scaledCanvas = Helper.downScaleCanvas(illustCanvas, scale);


                var canvas = Helper.imageToCanvas(_rawShareImage, _rawShareImage.width, _rawShareImage.height);
                var ctx = canvas.getContext("2d");

                //ctx.drawImage(scaledCanvas, illustGeom.x, illustGeom.y);
                ctx.drawImage(illustCanvas, illustGeom.x, illustGeom.y, illustGeom.width, illustGeom.height);


                return canvas;
            }
            else
            {
                return null;
            }
        },

        resize: function (width, height, scale)
        {
            self.IllustratorList.resize();
            self.IllustList.resize();
        }
    };


    function build(templates)
    {
        _stepDic =
        {
            "illustrator-list": self.IllustratorList,
            "illust-list": self.IllustList,
            "form": CommonForm
        };

        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#fill");

        self.Title.init($doms.container.find(".content-title"));
        self.IllustratorList.init($doms.container.find(".illustrator-list"));
        self.IllustList.init($doms.container.find(".illust-list"));
        self.Success.init($("#fill-success"));

        $doms.container.detach();
    }

    function show(cb)
    {
        //if(!Main.settings.fbToken)
        //{
        //    cb.apply();
        //    return;
        //}

        $("#scene-container").append($doms.container);

        _currentStep = 'illustrator-list';

        //self.IllustList.toIllust(3, 0);
        //_currentStep = 'illust-list';


        self.Title.toggleFormMode(false).show();
        _stepDic[_currentStep].show(0, cb);

        //self.Success.show();
    }

    function hide(cb)
    {
        _stepDic[_currentStep].hide();

        self.Title.hide(0, function()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

}());


(function ()
{
    var $doms = {},
        _isHiding = true;

    window.Fill.Title =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.container.detach();
        },
        show: function (delay, cb)
        {
            if(!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);

            if (delay === undefined) delay = 0;

            var tl = new TimelineMax;
            tl.set($doms.container, {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1}, delay);
            tl.add(function ()
            {
                if(cb) cb.apply();
            });

        },
        hide: function (delay, cb)
        {
            if(_isHiding) return;
            _isHiding = true;

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0}, delay);
            tl.add(function ()
            {
                $doms.container.detach();
                if(cb) cb.apply();
            });

        },

        toggleFormMode: function(b)
        {
            $doms.container.toggleClass("form-mode", b);

            return this;
        }
    };

}());


(function ()
{
    var $doms = {},
        _inMobileMode = false,
        _isHiding = true;

    var self = window.Fill.IllustratorList =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();


            //setupIllustrator(1);
            //setupIllustrator(2);
            //setupIllustrator(3);

            buildMobile();




            $doms.container.detach();
        },
        show: function (delay, cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);

            self.resize();

            if (delay === undefined) delay = 0;

            var tl = new TimelineMax;
            tl.set($doms.container, {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1}, delay);
            tl.add(function ()
            {
                if (cb) cb.apply();
            });

        },
        hide: function (delay, cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0}, delay);
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        },
        
        resize: function()
        {
            var vp = Main.settings.viewport;
            if(vp.changed)
            {
                if(vp.index == 0)
                {
                    _inMobileMode = true;
                    self.toIndex(1, 0);
                }
                else
                {
                    _inMobileMode = false;

                    $doms.container.find(".illustrator").css("left", "").css("transform", "");

                }
            }
        },

        toIndex: null

    };


    function buildMobile()
    {
        var $container = $doms.container;

        var currentIndex = 0,
            isLocking = false;

        $doms.illustrators = [];

        //$doms.$illustrators = $illustrators;

        setupOne(0);
        setupOne(1);
        setupOne(2);

        self.toIndex = toIndex;

        toIndex(1, 0);

        if(Modernizr.touchevents)
        {
            var hammer = new Hammer($container[0]);

            hammer.on("swipeleft", function()
            {
                if(_inMobileMode) toIndex(currentIndex+1);
            });

            hammer.on("swiperight", function()
            {
                if(_inMobileMode) toIndex(currentIndex-1);
            });
        }


        function setupOne(index)
        {
            var $dom = $doms.illustrators[index] = $container.find(".illustrator:nth-child("+(index+1)+")").on("click", function(event)
            {
                if(event.target.className == 'illustrator')
                {
                    if(_inMobileMode)
                    {
                        if(index == currentIndex)
                        {
                            Fill.toStep("illust-list", {illustratorIndex: (index+1)});
                        }
                        else
                        {
                            toIndex(index);
                        }
                    }
                    else
                    {
                        Fill.toStep("illust-list", {illustratorIndex: (index+1)});
                    }
                }
            });

            $dom.find('.btn-select').on("click", function()
            {
                Fill.toStep("illust-list", {illustratorIndex: (index+1)});
            });
        }

        function toIndex(index, duration)
        {
            if(isLocking) return;
            if(index < 0 || index > 2) return;

            currentIndex = index;

            isLocking = true;

            if(duration === undefined) duration = .5;

            var i,
                wGap = 492,
                tx,
                tl = new TimelineMax,
                offsetIndex,
                transformOrigin,
                scale;

            for(i=0;i<3;i++)
            {
                offsetIndex = (i - currentIndex);

                scale = offsetIndex == 0? 1: .8;

                if(offsetIndex == 0)
                {
                    transformOrigin = "center center";
                }
                else if(offsetIndex < 0)
                {
                    transformOrigin = "right center";
                }
                else
                {
                    transformOrigin = "left center";
                }

                tx = offsetIndex * wGap;
                tl.to($doms.illustrators[i], duration, {left: tx, scale: scale, transformOrigin: transformOrigin}, 0);
            }

            tl.add(function()
            {
                isLocking = false;
            })
        }
    }

}());



(function ()
{
    var $doms = {},
        _isHiding = true,
        _shareImageUrl;

    var self = window.Fill.Success =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $("body");

            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
                self.hide();
                Fill.toStep("illustrator-list");
            });

            $doms.btnShare = $doms.container.find(".btn-share").on("click", function()
            {
                //self.hide();

                FB.ui
                (
                    {
                        method:"share",
                        display: "iframe",
                        href: Utility.getPath(),
                        picture: _shareImageUrl + "?v=" + new Date().getTime(),
                        title: CommonForm.getLastUserName() + "參加了輕鬆小品暑假打工爽的咧",
                        description: '獨家微疼、啾啾妹、小學課本的逆襲爽畫作，選擇一個你喜歡的插畫家填空爽文字，就有機會獲得7-11禮券500元＋一箱輕鬆小品，有GO爽～～～'
                    },function(response)
                    {
                        if(!response.error && !response.error_code)
                        {
                            self.hide();
                            Fill.toStep("illustrator-list");
                        }
                    }
                );
            });

            $doms.container.detach();
        },

        show: function (delay, cb)
        {
            if(!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);

            if (delay === undefined) delay = 0;

            var tl = new TimelineMax;
            tl.set($doms.container, {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1}, delay);
            tl.add(function ()
            {
                if (cb) cb.apply();
            });

        },
        hide: function (delay, cb)
        {
            if(_isHiding) return;
            _isHiding = true;

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0}, delay);
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });

        },

        setShareImageUrl: function(url)
        {
            _shareImageUrl = url;
        }
    };

}());
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
                    x: 161,
                    y: 106,
                    width: 272,
                    height: 207
                };

                var illustCanvas = _sendingIllust.getOutputCanvas(),
                    scale = illustGeom.width / illustCanvas.width;

                var scaledCanvas = Helper.downScaleCanvas(illustCanvas, scale);


                var canvas = Helper.imageToCanvas(_rawShareImage, _rawShareImage.width, _rawShareImage.height);
                var ctx = canvas.getContext("2d");

                ctx.drawImage(scaledCanvas, illustGeom.x, illustGeom.y);


                return canvas;
            }
            else
            {
                return null;
            }
        },

        resize: function (width, height, scale)
        {

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
        if(!Main.settings.fbToken)
        {
            cb.apply();
            return;
        }

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
        _isHiding = true;

    window.Fill.IllustratorList =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();


            setupIllustrator(1);
            setupIllustrator(2);
            setupIllustrator(3);


            $doms.container.detach();
        },
        show: function (delay, cb)
        {
            if (!_isHiding) return;
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
            if (_isHiding) return;
            _isHiding = true;

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0}, delay);
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        }
    };

    function setupIllustrator(index)
    {
        var $dom = $doms["illustrator" + index] = $doms.container.find(".illustrator:nth-child("+index+")");

        $dom.on("click", function()
        {
            Fill.toStep("illust-list", {illustratorIndex: index});
        });
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
                        picture: _shareImageUrl
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
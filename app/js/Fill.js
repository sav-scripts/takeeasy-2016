(function ()
{
    var $doms = {},
        _isInit = false,
        _currentStep = 'upload',
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
                    build(templates);
                    _isInit = true;
                    cb.apply(null);
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
                    CommonForm.setMode("participate");
                    //self.UploadStep.hide(0, CommonForm.show);
                }
                else if(_currentStep == "illust-list")
                {
                    self.IllustList.toIllust((options.illustratorIndex-1)*3, 0);
                }

                _stepDic[_currentStep].show();
            });
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
        self.Title.show();
        _stepDic[_currentStep].show(0, cb);
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

        $dom.find(".btn-select").on("click", function()
        {
            Fill.toStep("illust-list", {illustratorIndex: index});
        });
    }

}());

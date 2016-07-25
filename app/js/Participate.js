(function ()
{
    var $doms = {},
        _isInit = false,
        _currentStep = 'upload',
        _stepDic;

    var self = window.Participate =
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
                        {url: "_participate.html", startWeight: 0, weight: 100, dom: null}
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

        toStep: function(step)
        {
            if(step == _currentStep) return;

            _stepDic[_currentStep].hide();

            _currentStep = step;

            if(_currentStep == "form")
            {
                CommonForm.setMode("participate");
                //self.UploadStep.hide(0, CommonForm.show);
            }

            _stepDic[_currentStep].show();
        },

        resize: function (width, height, scale)
        {

        }
    };

    function build(templates)
    {
        _stepDic =
        {
            "upload": self.UploadStep,
            "form": CommonForm
        };

        $("#invisible-container").append(templates[0].dom);

        $doms.container = $("#participate");

        self.Title.init($doms.container.find(".content-title"));
        self.UploadStep.init($doms.container.find(".content-step-upload"));
        self.Success.init($("#participate-success"));

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

        _currentStep = 'upload';
        self.Title.show();

        //_currentStep = 'form';
        //self.Title.show();

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

    window.Participate.Title =
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
        _isHiding = true,
        _shareEntrySerial = null;

    var self = window.Participate.Success =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $("body");

            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
                self.hide();

                SceneHandler.toHash("/Index");
            });

            $doms.btnShare = $doms.container.find(".btn-share").on("click", function()
            {
                FB.ui
                (
                    {
                        method:"share",
                        display: "iframe",
                        href: Utility.getPath() + "?serial=" + _shareEntrySerial
                    },function(response)
                    {
                        if(!response.error && !response.error_code)
                        {
                            self.hide();
                            SceneHandler.toHash("/Index");
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

        setShareEntrySerial: function(serial)
        {
            _shareEntrySerial = serial;
        }
    };

}());
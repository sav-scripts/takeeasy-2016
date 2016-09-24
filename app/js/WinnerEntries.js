(function ()
{
    var $doms = {},
        _currentIndex = 1,
        _numEntries = 26,
        _typeThehold =
        {
            1: 1,
            2: 6,
            3:16,
            4:26
        },
        _isLocking = false,
        _isInit = false;

    var self = window.WinnerEntries =
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
                        {url: "_winner_entries.html", startWeight: 0, weight: 100, dom: null}
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

        resize: function ()
        {
            if(_isInit)
            {
                toContent(_currentIndex, true);
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#winner-entries");

        $doms.contentContainer = $doms.container.find(".contents");
        $doms.contentWrapper = $doms.contentContainer.find(".wrapper");

        $doms.btnLeft = $doms.container.find(".arrow-left").on('click', toPrevContent);
        $doms.btnRight = $doms.container.find(".arrow-right").on('click', toNextContent);

        $doms.entriesType = $doms.container.find(".entries-type");

        updateTypeLabel(_currentIndex);


        $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
        {
            var lashHash = SceneHandler.getLastHash();
            if(lashHash)
            {
                SceneHandler.toHash(lashHash);
            }
            else
            {
                SceneHandler.toHash("/Index");
            }
        });


        $doms.container.detach();
    }

    function toPrevContent()
    {
        toContent(_currentIndex-1);
    }

    function toNextContent()
    {
        toContent(_currentIndex+1);
    }

    function toContent(index, forResize)
    {
        if(!forResize && _isLocking) return;

        _isLocking = true;

        _currentIndex = index;

        updateTypeLabel(_currentIndex);


        var gap = $doms.contentContainer.width(),
            targetLeft = -gap * (_currentIndex-1);

        var tl = new TimelineMax;


        if(_currentIndex === 0)
        {
            $doms.contentContainer.toggleClass("vp-1", true);
        }
        else if(_currentIndex === (_numEntries+1))
        {
            $doms.contentContainer.toggleClass("vp-2", true);
        }

        tl.to($doms.contentWrapper[0],.7, {left:targetLeft, ease:Power2.easeInOut});
        tl.add(function()
        {
            if(_currentIndex > _numEntries) _currentIndex = 1;
            if(_currentIndex < 1) _currentIndex = _numEntries;

            $doms.contentContainer.toggleClass("vp-1", false);
            $doms.contentContainer.toggleClass("vp-2", false);

            targetLeft = -gap * (_currentIndex-1);

            TweenMax.set($doms.contentWrapper[0], {left:targetLeft});

            _isLocking = false;
        });

        if(forResize) tl.duration(0.02);
    }

    function updateTypeLabel(index)
    {
        if(index > _numEntries) index = 1;
        if(index < 1) index = _numEntries;

        var i;
        for(i in _typeThehold)
        {
            if(index <= _typeThehold[i])
            {
                break;
            }
        }

        $doms.entriesType.find("img").css('display', 'none');
        $doms.entriesType.find("img:nth-child("+i+")").css('display', 'block');
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container).toggleClass('winner-entry-mode', true);

        self.resize();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            cb.apply();
        });
    }

    function hide(cb)
    {
        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            $("#scene-container").toggleClass('winner-entry-mode', false);
            cb.apply();
        });
    }

}());
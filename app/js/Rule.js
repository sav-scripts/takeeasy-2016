(function ()
{
    var $doms = {},
        _isInit = false;

    window.Rule =
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
                        {url: "_rule.html", startWeight: 0, weight: 100, dom: null}
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

        resize: function (width, height, scale)
        {

        }
    };

    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#rule");

        $doms.contentContainer = $doms.container.find(".content-container");

        var containerHeight = $doms.contentContainer.height();
        var ss = new SimpleScroller($doms.contentContainer[0], null, 0, Modernizr.touchevents).update(true);

        var $ssContainer = $(ss.doms.container);
        ss.containerSize(null, containerHeight).scrollBound($ssContainer.width()+10, 3, 0, containerHeight-44).update(true);

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

    function show(cb)
    {
        $("#scene-container").append($doms.container);

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
            cb.apply();
        });
    }

}());
(function ()
{
    var $doms = {},
        _isInit = false;

    window.Index =
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
            Main.loginFB("/Participate", function()
            {
                SceneHandler.toHash("/Participate");
            });
        });


        $doms.btnToParticipate = $doms.container.find(".button-2").on("click", function()
        {
            Main.loginFB("/Fill", function()
            {
                SceneHandler.toHash("/Fill");
            });
        });

        $doms.btnToEntries = $doms.container.find(".button-3").on("click", function()
        {
            Main.loginFB("/Entries", function()
            {
                SceneHandler.toHash("/Entries");
            });
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
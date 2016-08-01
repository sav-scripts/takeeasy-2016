(function ()
{
    var $doms = {},
        _isInit = false,
        _isMobieInit = false;

    var self = window.Reviewer =
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
                        {url: "_reviewer.html", startWeight: 0, weight: 100, dom: null}
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
            var vp = Main.settings.viewport;
            if(vp.index == 0)
            {
                buildMobile();
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#reviewer");


        $doms.container.detach();
    }

    function buildMobile()
    {
        if(_isMobieInit) return;
        _isMobieInit = true;

        $doms.reviewersM = $doms.container.find(".reviewers-m");

        var currentIndex = 0,
            $reviewers = [],
            isLocking = false;

        setupOne(0);
        setupOne(1);
        setupOne(2);

        toIndex(1, 0);

        if(Modernizr.touchevents)
        {
            var hammer = new Hammer($doms.reviewersM[0]);

            hammer.on("swipeleft", function(event)
            {
                //console.log("on swipe left");
                toIndex(currentIndex+1);
            });

            hammer.on("swiperight", function(event)
            {
                //console.log("on swipe right");
                toIndex(currentIndex-1);
            });
        }


        function setupOne(index)
        {
            $reviewers[index] = $doms.reviewersM.find(".reviewer:nth-child("+(index+1)+")").on("mousedown", function()
            {
                toIndex(index);
            });
        }

        function toIndex(index, duration)
        {
            if(isLocking) return;
            if(index < 0 || index > 2 || currentIndex == index) return;

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
                tl.to($reviewers[i], duration, {left: tx, scale: scale, transformOrigin: transformOrigin}, 0);
            }

            tl.add(function()
            {
                isLocking = false;
            })
        }
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();

        var doms = $doms.container.find("div").toArray();
        doms.sort(function(){return 0.5-Math.random()});

        $.each(doms, function(index, dom)
        {
            dom.style.marginTop = (Math.random()*200 - 100) + 'px';
        });

        var tl = new TimelineMax;
        tl.set(doms, {autoAlpha: 0});
        tl.set($doms.container, {autoAlpha: 1});
        tl.staggerTo(doms,.6, {autoAlpha:1, marginTop:0, ease:Back.easeOut},.01);
        //tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            cb.apply();
        });


        /*
        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            cb.apply();
        });
        */
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
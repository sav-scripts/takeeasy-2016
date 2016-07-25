/**
 * Created by sav on 2016/7/25.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _illustIndex,
        _isLocking = false,
        NUM_ILLUSTS = 9,
        _gapSetting =
        {
            0:{
                wGap:100,
                wrapSize:1,
                duration:.4
            },
            1:{
                wGap:366,
                wrapSize: 3,
                duration:.8
            }
        };

    var self = window.Fill.IllustList =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.listContainer = $doms.container.find(".list-container");

            $doms.arrowLeft = $doms.container.find(".arrow-left").on("click", function()
            {
                var wrapSize = _gapSetting[Main.settings.viewport.index].wrapSize;

                self.toIllust(_illustIndex - wrapSize);
            });

            $doms.arrowRight = $doms.container.find(".arrow-right").on("click", function()
            {
                var wrapSize = _gapSetting[Main.settings.viewport.index].wrapSize;

                self.toIllust(_illustIndex + wrapSize);

            });

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

        },

        toIllust: function(index, duration)
        {
            if(_isLocking) return;
            if(_illustIndex === index) return;
            if(index < 0 || index >= NUM_ILLUSTS) return;

            _isLocking = true;

            _illustIndex = index;

            updateArrows();

            if(duration === undefined) duration = _gapSetting[Main.settings.viewport.index].duration;

            var viewportIndex = Main.settings.viewport.index,
                wGap = _gapSetting[viewportIndex].wGap,
                tx = -wGap * _illustIndex;

            var tl = new TimelineMax;
            tl.to($doms.listContainer, duration, {left:tx, ease:Power1.easeInOut});
            tl.add(function()
            {
               _isLocking = false;
            });
        }
    };

    function updateArrows()
    {
        var wrapSize = _gapSetting[Main.settings.viewport.index].wrapSize;

        $doms.arrowLeft.toggleClass("hidding", (_illustIndex <= 0));
        $doms.arrowRight.toggleClass("hidding", (_illustIndex >= (NUM_ILLUSTS-wrapSize)));
    }

}());
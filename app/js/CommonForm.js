(function ()
{
    var $doms = {},
        _isHiding = true,
        _currentMode = null;

    window.CommonForm =
    {
        init: function ()
        {
            $doms.parent = $("#scene-container");
            $doms.container = $('#common-form');

            $doms.eulaContentContainer = $doms.container.find(".content-container");

            var containerHeight = $doms.eulaContentContainer.height();
            var ss = new SimpleScroller($doms.eulaContentContainer[0], null, 0, Modernizr.touchevents).update(true);

            var $ssContainer = $(ss.doms.container);
            ss.containerSize(null, containerHeight).scrollBound($ssContainer.width()-21, 0, 0, containerHeight-38).update(true);

            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {
                trySend();
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

        setMode: function(mode)
        {
            _currentMode = mode;
        }
    };

    function trySend()
    {
        if(_currentMode == "participate")
        {
            Participate.Success.show();
        }
    }

}());
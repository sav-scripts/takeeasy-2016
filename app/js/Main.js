(function(){

    "use strict";
    var _p = window.Main = {};

    _p.init = function()
    {
        ScalableContent.enableFixFullImage = true;
        ScalableContent.enableDrawBounds = true;

        $(window).on("resize", onResize);
        onResize();
    };

    function onResize()
    {
        var width = $(window).width(),
            height = $(window).height();


        //ScalableContent.updateView(1280, height);

        ScalableContent.updateView(width, height);
        ScalableContent.updateResizeAble();
    }

}());

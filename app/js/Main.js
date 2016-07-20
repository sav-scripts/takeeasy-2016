(function(){

    "use strict";
    var _p = window.Main = {};

    _p.init = function()
    {
        var hashArray =
        [
            "/Index",
            "/Participate",
            "/ParticipateForm"
        ],
        blockHashs =
        [
            //"/ParticipateForm"
        ];

        SceneHandler.init(hashArray,
        {
            blockHashs: blockHashs,
            listeningHashChange: true,
            version: Utility.urlParams.nocache == '1'? new Date().getTime(): "0",

            cbBeforeChange: function()
            {
            },
            cbContentChange: function(hashName)
            {
            },
            hashChangeTester: function(hashName)
            {
                return hashName;
            }
        });

        SceneHandler.toFirstHash();


        $(window).on("resize", onResize);
        onResize();
    };

    function onResize()
    {
        var width = $(window).width(),
            height = $(window).height();

        //ScalableContent.updateView(width, height);
        //ScalableContent.updateResizeAble();
    }

}());

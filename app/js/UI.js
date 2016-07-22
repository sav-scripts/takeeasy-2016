/**
 * Created by sav on 2016/7/22.
 */
(function(){

    var _isHiding = true,
        $doms = {};

    var self = window.Menu =
    {
        init: function()
        {
            $doms.container = $("#menu");

            $doms.cover = $("#menu-cover").on("click", function()
            {
                self.hide();
            });

            $doms.trigger = $doms.container.find(".icon").on("click", function()
            {
                _isHiding? self.show(): self.hide();
            });

            $doms.buttonContainer = $doms.container.find(".button-container");

            $doms.buttons = {};

            setupButton(1, "index", function()
            {
                SceneHandler.toHash("/Index");
            });

            setupButton(3, "participate", function()
            {
                SceneHandler.toHash("/Participate");
            });

            setupButton(7, "participate", function()
            {
                SceneHandler.toHash("/Rule");
            });

            //$doms.buttonContainer.css("display", 'none').css("visibility", "visible");
            $doms.buttonContainer.css("visibility", "visible").toggleClass("close-mode", true);
        },

        show: function()
        {
            if(!_isHiding) return;
            _isHiding = false;

            $doms.cover.css("display", "block");

            //$doms.buttonContainer.css("display", "block");
            $doms.buttonContainer.toggleClass("close-mode", false);

        },

        hide: function()
        {
            if(_isHiding) return;
            _isHiding = true;

            $doms.cover.css("display", "none");

            //$doms.buttonContainer.css("display", "none");
            $doms.buttonContainer.toggleClass("close-mode", true);

        }
    };

    function setupButton(index, name, onClick)
    {
        var $dom = $doms.buttons[name] = $doms.buttonContainer.find(".button:nth-child("+index+")");

        $dom.on("click", function()
        {
            self.hide();

            if(onClick) onClick.call();
        });
    }

}());
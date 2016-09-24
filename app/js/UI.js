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

            $doms.logo = $("#logo").on("click", function()
            {
                SceneHandler.toHash("/Index");
            });

            $doms.buttonContainer = $doms.container.find(".button-container");

            $doms.buttons = {};

            setupButton(1, "index", function()
            {
                ga("send", "event", "menu", "click", "index");
                SceneHandler.toHash("/Index");
            });

            setupButton(2, "reviewer", function()
            {
                ga("send", "event", "menu", "click", "artist");
                SceneHandler.toHash("/Reviewer");
            });

            setupButton(3, "participate", function()
            {
                ga("send", "event", "menu", "click", "parttime");

                alert("本活動已經截止 感謝您的參與");

                //Main.loginFB("/Participate", function()
                //{
                //    SceneHandler.toHash("/Participate");
                //});
            });

            setupButton(4, "vote", function()
            {
                ga("send", "event", "menu", "click", "vote");

                alert("本活動已經截止 感謝您的參與");

                //Main.loginFB("/Participate", function()
                //{
                //    SceneHandler.toHash("/Entries");
                //});
            });

            setupButton(5, "fill", function()
            {
                ga("send", "event", "menu", "click", "copywork");

                alert("本活動已經截止 感謝您的參與");

                //Main.loginFB("/Fill", function()
                //{
                //    SceneHandler.toHash("/Fill");
                //});
            });

            setupButton(6, "entries", function()
            {
                ga("send", "event", "menu", "click", "artworks");

                //alert("本活動已經截止 感謝您的參與");
                //return;

                Main.loginFB("/Participate", function()
                {
                    SceneHandler.toHash("/Entries");
                });
            });

            setupButton(7, "rule", function()
            {
                ga("send", "event", "menu", "click", "rule");
                SceneHandler.toHash("/Rule");
            });

            setupButton(8, "winners", function()
            {
                ga("send", "event", "menu", "click", "winners");
                SceneHandler.toHash("/Winners");
            });

            setupButton(9, "winner entries", function()
            {
                ga("send", "event", "menu", "click", "winner entries");
                SceneHandler.toHash("/WinnerEntries");
            });

            // 接下來兩個按鈕 ga event name 是: winner 和 exhibition


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

    function setupButton(index, name, onclick)
    {
        var $dom = $doms.buttons[name] = $doms.buttonContainer.find(".button:nth-child("+index+")");

        $dom.toggleClass("activated", true).on("click", function()
        {
            self.hide();

            if(onclick) onclick.call();
        });
    }

}());
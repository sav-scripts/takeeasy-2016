(function ()
{
    var $doms = {},
        _isHiding = true;

    var self = window.EntryView =
    {
        init: function ()
        {
            $doms.parent = $("#scene-container");
            $doms.container = $('#entry-view');

            $doms.imagePreview = $doms.container.find(".image-preview");


            $doms.optionalFields = $doms.container.find(".optional-fields");

            $doms.arrowLeft = $doms.container.find(".arrow-left");
            $doms.arrowRight = $doms.container.find(".arrow-right");

            $doms.fields =
            {
                numVotes: $doms.container.find(".field-num-votes"),
                serial: $doms.container.find(".field-serial"),
                author: $doms.container.find(".field-author"),
                description: $doms.container.find(".field-description")
            };

            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
                self.hide();
            });


            $doms.container.detach();
        },
        showPreview: function(canvas, description)
        {
            $doms.imagePreview.empty();
            $doms.imagePreview.append(canvas);

            $doms.fields.description.html(description);

            toPreviewMode();
            self.show();
        },
        showEntry: function()
        {
            toEntryMode();
            self.show();

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
        }
    };

    function toPreviewMode()
    {
        $doms.optionalFields.toggleClass("hidding", true);

        $doms.arrowLeft.toggleClass("hidding", true);
        $doms.arrowRight.toggleClass("hidding", true);
    }

    function toEntryMode()
    {
        $doms.optionalFields.toggleClass("hidding", false);

        $doms.arrowLeft.toggleClass("hidding", false);
        $doms.arrowRight.toggleClass("hidding", false);
    }

}());
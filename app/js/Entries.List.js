(function ()
{
    var $doms = {},
        _isHiding = true,
        _thumbs = [];

    var self = window.Entries.List =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.arrowLeft = $doms.container.find(".arrow-left");
            $doms.arrowRight = $doms.container.find(".arrow-right");


            self.Thumb.$container = $doms.container.find(".output-container");
            self.Thumb.$sample = $doms.container.find(".thumb-container").detach();

            self.PageIndex.init($doms.container.find(".page-index-container"));

            createThumb(123, 'xxx', '0001', "./images/participate-upload-title-girl.png");
            createThumb(321, 'xxx', '0002', "./images/participate-upload-title-girl.png");

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

        updateArrows: function(haveLastPage, haveNextPage)
        {
            $doms.arrowLeft.css("display", haveLastPage? "block": "none");
            $doms.arrowRight.css("display", haveNextPage? "block": "none");
        }
    };

    function createThumb(numVotes, authorName, serial, thumbUrl)
    {
        var thumb = new self.Thumb(numVotes, authorName, serial, thumbUrl);

        _thumbs.push(thumb);
    }

    function clearThumbs()
    {
        var i, thumb;
        for(i=0;i<_thumbs.length;i++)
        {
            thumb = _thumbs[i];
            thumb.destroy();
        }

        _thumbs = [];
    }

}());


(function(){

    var $doms = {},
        BLOCK_SIZE = 10,
        _numBlocks,
        _numPages,
        _pageIndex;

    var self = window.Entries.List.PageIndex =
    {
        init: function($container)
        {
            $doms.container = $container;

            $doms.btnPrevPage = $doms.container.find(".word-prev-page").on("click", function()
            {
                self.toPrevPage();
            }).detach();

            $doms.btnNextPage = $doms.container.find(".word-next-page").on("click", function()
            {
                self.toNextPage();

            }).detach();

            $doms.btnPrevBlock = $doms.container.find(".word-prev-block").on("click", function()
            {
                self.toPrevBlock();
            }).detach();

            $doms.btnNextBlock = $doms.container.find(".word-next-block").on("click", function()
            {
                self.toNextBlock();
            }).detach();

            self.clear();

            self.update(72, 6);
        },

        toPrevPage: function()
        {
            self.toPage(_pageIndex-1);
        },

        toNextPage: function()
        {
            self.toPage(_pageIndex+1);
        },

        toPrevBlock: function()
        {
            self.toPage(_pageIndex-BLOCK_SIZE);
        },

        toNextBlock: function()
        {
            self.toPage(_pageIndex+BLOCK_SIZE);
        },

        toPage: function(pageIndex)
        {
            if(pageIndex < 1) pageIndex = 1;
            if(pageIndex > _numPages) pageIndex = _numPages;

            self.update(_numPages, pageIndex);
        },

        update: function(numPages, pageIndex)
        {
            if(pageIndex < 1 || pageIndex > numPages)
            {
                console.error("illegal params, numPages: " + numPages + ", pageIndex: " + pageIndex);
                return;
            }

            self.clear();

            _numPages = numPages;
            _pageIndex = pageIndex;


            var numWordCreated = 0,
                firstWordIndex,
                lastWordIndex;

            createWord(pageIndex, false, true);

            pageIndex++;
            numWordCreated++;

            while(numWordCreated < BLOCK_SIZE && pageIndex <= _numPages)
            {
                createWord(pageIndex, false, false);

                pageIndex++;
                numWordCreated++;
            }

            lastWordIndex = pageIndex-1;

            pageIndex = _pageIndex-1;

            while(numWordCreated < BLOCK_SIZE && pageIndex >= 1)
            {
                createWord(pageIndex, true, false);

                pageIndex--;
                numWordCreated++;
            }

            firstWordIndex = pageIndex+1;

            //console.log("firstWordIndex = " + firstWordIndex);
            //console.log("lastWordIndex = " + lastWordIndex);

            var hasLastPage = false,
                hasNextPage = false;

            if(firstWordIndex !== 1)
            {
                $doms.container.prepend($doms.btnPrevBlock);
            }

            if(_pageIndex !== 1)
            {
                $doms.container.prepend($doms.btnPrevPage);
                hasLastPage = true;
            }

            if(lastWordIndex !== _numPages)
            {
                $doms.container.append($doms.btnNextBlock);
            }

            if(_pageIndex !== _numPages)
            {
                $doms.container.append($doms.btnNextPage);
                hasNextPage = true;
            }

            Entries.List.updateArrows(hasLastPage, hasNextPage);
        },

        clear: function()
        {
            $doms.btnPrevPage.detach();
            $doms.btnNextPage.detach();
            $doms.btnPrevBlock.detach();
            $doms.btnNextBlock.detach();

            $doms.container.empty();
        }

    };

    function createWord(index, insertFromFront, activeIt)
    {
        var dom = document.createElement("div");
        dom.className = "word";
        dom.innerHTML = index;

        var $word = $(dom);

        $word.toggleClass("activated", activeIt);

        insertFromFront? $doms.container.prepend($word): $doms.container.append($word);

        if(!activeIt)
        {
            $word.on("click", function()
            {
                self.toPage(index);
            });
        }


        return $word;
    }

}());




(function(){

    window.Entries.List.Thumb = Thumb;

    Thumb.$sample = null;
    Thumb.$container = null;

    function Thumb(numVotes, authorName, serial, thumbUrl)
    {
        var $dom = this.$dom = Thumb.$sample.clone();

        $dom.find(".text-num-votes").text("累積票數：" + numVotes);
        $dom.find(".text-author").text("作者：" + authorName);
        $dom.find(".text-serial").text(serial);

        if(thumbUrl)
        {
            var image = document.createElement("img");

            image.onload = function()
            {
                $dom.find(".thumb").append(image);
                TweenMax.from(image,.5, {opacity:0});
            };

            image.src = thumbUrl;
        }

        Thumb.$container.append($dom);
    }

    Thumb.prototype =
    {
        $dom: null,

        destroy: function()
        {
            this.$dom.detach();
        }
    };

}());
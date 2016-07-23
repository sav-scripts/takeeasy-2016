(function ()
{
    var $doms = {},
        _isHiding = true,
        _keyword = "",
        _searchType = "user_name",
        _sortType = "date",
        _pageSize = 10,
        _thumbs = [],
        _oldThumbs = [],
        _thumbGapSetting =
        {
            0: {w:10, h:10},
            1: {w:36, h:13}
        },
        _isLocking = false;

    var self = window.Entries.List =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.arrowLeft = $doms.container.find(".arrow-left").on("click", function()
            {
                self.PageIndex.toPrevPage();
            });

            $doms.arrowRight = $doms.container.find(".arrow-right").on("click", function()
            {
                self.PageIndex.toNextPage();
            });

            self.updateArrows(false, false);

            $doms.outputMask = $doms.container.find(".output-mask");

            $doms.outputA = $doms.container.find(".output-container:nth-child(1)");
            $doms.outputB = $doms.container.find(".output-container:nth-child(2)").detach();

            //self.Thumb.$container = $doms.outputA;
            self.Thumb.$sample = $doms.container.find(".thumb-container").detach();

            self.PageIndex.init($doms.container.find(".page-index-container"));

            $doms.keywordInput = $doms.container.find(".field-keyword");

            $doms.btnSearchName = $doms.container.find(".btn-name").on("click", function()
            {
                _searchType = "user_name";
                _keyword = $doms.keywordInput.val();
                $doms.keywordInput.val('');
                self.doSearch(0, true);

            });

            $doms.btnSearchSerial = $doms.container.find(".btn-serial").on("click", function()
            {
                _searchType = "serial";
                _keyword = $doms.keywordInput.val();
                $doms.keywordInput.val('');
                self.doSearch(0, true);
            });

            $doms.btnSortByDate = $doms.container.find(".tab-by-date").on("click", function()
            {
                _keyword = '';
                $doms.keywordInput.val('');
                self.changeSortType("date");
            });

            $doms.btnSortByRank = $doms.container.find(".tab-by-rank").on("click", function()
            {
                _keyword = '';
                $doms.keywordInput.val('');
                self.changeSortType("votes");
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

                self.doSearch(0, true);
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

        resize: function(viewport)
        {

        },

        changeSortType: function(newType)
        {
            if(newType == _sortType) return;
            if(_isLocking) return;

            _searchType = "user_name";
            _sortType = newType;

            if(_sortType == "date")
            {
                $doms.btnSortByDate.toggleClass("activated", true);
                $doms.btnSortByRank.toggleClass("activated", false);

                $doms.keywordInput.val('');
                self.doSearch(0, true);
            }
            else
            {
                $doms.btnSortByDate.toggleClass("activated", false);
                $doms.btnSortByRank.toggleClass("activated", true);

                $doms.keywordInput.val('');
                self.doSearch(0, true);
            }
        },

        updateArrows: function(haveLastPage, haveNextPage)
        {
            $doms.arrowLeft.css("display", haveLastPage? "block": "none");
            $doms.arrowRight.css("display", haveNextPage? "block": "none");
        },

        doSearch: function(pageIndex, isNewSearch, oldPageIndex)
        {
            if(_isLocking) return;
            _isLocking = true;

            var fromDirection = "bottom";

            //_keyword = $doms.keywordInput.val();


            if(!isNewSearch)
            {
                if(pageIndex > oldPageIndex)
                {
                    fromDirection = "right";
                }
                else if(pageIndex < oldPageIndex)
                {
                    fromDirection = "left";
                }
            }

            Loading.show();

            var params =
            {
                "keyword": _keyword,
                "search_type": _searchType,
                "sort_type": _sortType,
                "page_index": pageIndex,
                "page_size": _pageSize
            };

            ApiProxy.callApi("entries_search", params, function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                }
                else
                {
                    //console.log("data = " + response.data);

                    self.PageIndex.update(parseInt(response.num_pages), parseInt(response.page_index)+1);
                    self.updateEntries(response.data, fromDirection);
                }

                Loading.hide();
            });
        },

        updateEntries: function(data, fromDirection)
        {
            //clearThumbs();

            _oldThumbs = _thumbs;
            _thumbs = [];

            var i, obj;
            for(i=0;i<data.length;i++)
            {
                obj = data[i];

                createThumb($doms.outputB, obj.num_votes, obj.name, obj.serial, obj.url);
            }

            self.animeEntries(fromDirection);
        },

        animeEntries: function(fromDirection)
        {
            var gapSetting = _thumbGapSetting[Main.settings.viewport.index];

            $doms.outputMask.append($doms.outputB);

            var offsetY = $doms.outputMask.height() + gapSetting.h,
                offsetX = $doms.outputMask.width() + gapSetting.w;

            var tl = new TimelineMax,
                duration = .5,
                ease = Power3.easeInOut;

            if(fromDirection == 'bottom')
            {
                ease = Power2.easeInOut;
                tl.set($doms.outputB, {left: 0, top: offsetY});
                tl.to($doms.outputA,duration,{top:-offsetY, ease:ease}, 0);
                tl.to($doms.outputB,duration,{top:0, ease:ease}, 0);
            }
            else if(fromDirection == 'right')
            {
                duration *= (offsetX / offsetY);
                tl.set($doms.outputB, {left: offsetX, top: 0});
                tl.to($doms.outputA,duration,{left:-offsetX, ease:ease}, 0);
                tl.to($doms.outputB,duration,{left:0, ease:ease}, 0);

            }
            else if(fromDirection == 'left')
            {
                duration *= (offsetX / offsetY);
                tl.set($doms.outputB, {left: -offsetX, top: 0});
                tl.to($doms.outputA,duration,{left:offsetX, ease:ease}, 0);
                tl.to($doms.outputB,duration,{left:0, ease:ease}, 0);
            }

            tl.add(function()
            {
                var holder = $doms.outputA;
                $doms.outputA = $doms.outputB;
                $doms.outputB = holder;

                $doms.outputB.detach();
                clearThumbs(_oldThumbs);
                _oldThumbs = [];

                _isLocking = false;
            });


        }
    };

    function createThumb($container, numVotes, authorName, serial, thumbUrl)
    {
        var thumb = new self.Thumb($container, numVotes, authorName, serial, thumbUrl);

        _thumbs.push(thumb);
    }

    function clearThumbs(thumbArray)
    {
        var i, thumb;
        for(i=0;i<thumbArray.length;i++)
        {
            thumb = thumbArray[i];
            thumb.destroy();
        }
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

            //self.update(72, 6);
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
            var oldPageIndex = _pageIndex;

            if(pageIndex < 1) pageIndex = 1;
            if(pageIndex > _numPages) pageIndex = _numPages;

            Entries.List.doSearch(pageIndex-1, false, oldPageIndex-1);

            //self.update(_numPages, pageIndex);
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
    //Thumb.$container = null;

    function Thumb($container, numVotes, authorName, serial, thumbUrl)
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

        $container.append($dom);
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
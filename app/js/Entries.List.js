(function ()
{
    var $doms = {},
        _isHiding = true,
        _isLocking = false,
        _keyword = "",
        _sortType = "date",
        _pageSize = 10,
        _thumbs = [],
        _oldThumbs = [],
        _lastSearchSetting,
        _isFirstSearchExecuted = false,
        _thumbGapSetting =
        {
            0: {w:10, h:10},
            1: {w:36, h:13}
        };

    var self = window.Entries.List =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.arrowLeft = $doms.container.find(".arrow-left").on("mousedown", function()
            {
                self.PageIndex.toPrevPage();
            });

            $doms.arrowRight = $doms.container.find(".arrow-right").on("mousedown", function()
            {
                self.PageIndex.toNextPage();
            });

            self.updateArrows(false, false);

            $doms.outputMask = $doms.container.find(".output-mask");

            $doms.outputA = $doms.container.find(".output-container:nth-child(1)");
            $doms.outputB = $doms.container.find(".output-container:nth-child(2)").detach();

            //self.Thumb.$container = $doms.outputA;
            self.Thumb.$sample = $doms.container.find(".thumb-container").detach();


            $doms.pageIndexContainer = $doms.container.find(".page-index-container");
            self.PageIndex.init($doms.pageIndexContainer);

            $doms.loadingHint = $doms.container.find(".loading-hint").css("display", "none");

            $doms.keywordInput = $doms.container.find(".field-keyword").on("keyup", function(event)
            {
                if(event.keyCode == 13)
                {
                    $doms.btnSearchName.click();
                }
            });

            $doms.btnSearchName = $doms.container.find(".btn-name").on("click", function()
            {
                if(_isLocking) return;

                _keyword = $doms.keywordInput.val();
                //$doms.keywordInput.val('');
                self.doSearch(0, true);

            });

            $doms.btnSearchSerial = $doms.container.find(".btn-serial").on("click", function()
            {
                if(_isLocking) return;

                _keyword = $doms.keywordInput.val();
                $doms.keywordInput.val('');
                self.doSearch(0, true, null, true);
            });

            $doms.btnSortByDate = $doms.container.find(".tab-by-date").on("click", function()
            {
                if(_isLocking) return;

                self.changeSortType("date");
            });

            $doms.btnSortByRank = $doms.container.find(".tab-by-rank").on("click", function()
            {
                if(_isLocking) return;

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

                if(!_isFirstSearchExecuted)
                {
                    _isFirstSearchExecuted = true;
                    $doms.keywordInput.val('');
                    _keyword = '';
                    self.doSearch(0, true);
                }

                checkFirstEntry();
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
            _pageSize = viewport.index == 0? 4: 10;
        },

        changeSortType: function(newType)
        {
            if(newType == _sortType) return;
            if(_isLocking) return;

            _sortType = newType;

            if(_sortType == "date")
            {
                $doms.btnSortByDate.toggleClass("activated", true);
                $doms.btnSortByRank.toggleClass("activated", false);
            }
            else
            {
                $doms.btnSortByDate.toggleClass("activated", false);
                $doms.btnSortByRank.toggleClass("activated", true);
            }

            _keyword = $doms.keywordInput.val();
            self.doSearch(0, true);
        },

        updateArrows: function(haveLastPage, haveNextPage)
        {
            $doms.arrowLeft.css("display", haveLastPage? "block": "none");
            $doms.arrowRight.css("display", haveNextPage? "block": "none");
        },

        doSearch: function(pageIndex, isNewSearch, oldPageIndex, isSearchSerial)
        {
            if(_isLocking) return;
            _isLocking = true;

            loadingShow();

            var fromDirection = "bottom",
                serachingKeyword = _keyword;

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

            var params = _lastSearchSetting =
            {
                "keyword": _keyword,
                "search_type": isSearchSerial? "serial": "user_name",
                "status": isSearchSerial? "": "approved",
                "sort_type": _sortType,
                "page_index": pageIndex,
                "page_size": _pageSize
            };

            if(isSearchSerial)
            {
                ApiProxy.callApi("entries_search", params, 'entries_search.serial', function(response)
                {
                    if(response.error)
                    {
                        alert(response.error);
                    }
                    else
                    {
                        if(response.data.length == 0)
                        {
                            alert("很抱歉, 作品編號 ["+serachingKeyword+"] 並不存在");
                        }
                        else
                        {
                            var dataObj = response.data[0];
                            if(dataObj.status == 'approved')
                            {
                                EntryView.showEntry(dataObj);
                            }
                            else if(dataObj.status = 'reviewing')
                            {
                                Entries.Reviewing.show();
                            }
                            else if(dataObj.status = 'unapproved')
                            {
                                Entries.Unapproved.show();
                            }
                        }
                    }

                    loadingHide();
                    _isLocking = false;
                });
            }
            else
            {
                ApiProxy.callApi("entries_search", params, 'entries_search', function(response)
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

                    loadingHide();
                });
            }
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

                createThumb(i, $doms.outputB, obj.num_votes, obj.name, obj.serial, obj.thumb_url);
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

    function checkFirstEntry()
    {

        if(Entries.firstEntrySerial)
        {
            var serial = Entries.firstEntrySerial;
            Entries.firstEntrySerial = null;

            var params =
            {
                "keyword": serial,
                "search_type": "serial",
                "status": "",
                "sort_type": "date",
                "page_index": 0,
                "page_size": 1
            };

            ApiProxy.callApi("entries_search", params, 'entries_search.serial', function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                }
                else
                {
                    if(response.data.length == 0)
                    {
                        alert("很抱歉, 作品編號 ["+serial+"] 並不存在");
                    }
                    else
                    {
                        var dataObj = response.data[0];
                        if(dataObj.status == 'approved')
                        {
                            EntryView.showEntry(dataObj);
                        }
                        else if(dataObj.status = 'reviewing')
                        {
                            Entries.Reviewing.show();
                        }
                        else if(dataObj.status = 'unapproved')
                        {
                            Entries.Unapproved.show();
                        }
                    }
                }

            });


        }

    }

    function loadingShow()
    {
        $doms.loadingHint.css("display", "block");
        $doms.pageIndexContainer.css("display", "none");

        $doms.arrowLeft.css("visibility", "hidding");
        $doms.arrowRight.css("visibility", "hidding");
    }

    function loadingHide()
    {
        $doms.arrowLeft.css("visibility", "visible");
        $doms.arrowRight.css("visibility", "visible");

        var array = [$doms.arrowLeft, $doms.arrowRight, $doms.pageIndexContainer];

        var tl = new TimelineMax;
        tl.set(array, {opacity:0});
        tl.to(array,.4, {opacity:1});

        $doms.loadingHint.css("display", "none");
        $doms.pageIndexContainer.css("display", "block");

    }

    function createThumb(index, $container, numVotes, authorName, serial, thumbUrl)
    {
        var thumb = new self.Thumb($container, numVotes, authorName, serial, thumbUrl);
        _thumbs.push(thumb);

        thumb.$dom.on("click", function()
        {
            var params = $.extend({}, _lastSearchSetting),
                entryIndex = params.page_size * params.page_index + index;

            params.page_size = 1;
            params.page_index = entryIndex;

            EntryView.showEntryAt(params);
        });
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
        BLOCK_SIZE = 9,
        SIDE_BLOCK_SIZE = 4,
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
                console.log("illegal params, numPages: " + numPages + ", pageIndex: " + pageIndex);
                self.clear();
                return;
            }

            self.clear();

            _numPages = numPages;
            _pageIndex = pageIndex;


            var numWordCreated = 0,
                sideNumCreated = 0,
                firstWordIndex,
                lastWordIndex;

            createWord(pageIndex, false, true);

            pageIndex++;
            numWordCreated++;



            while(sideNumCreated < SIDE_BLOCK_SIZE && pageIndex <= _numPages)
            {
                createWord(pageIndex, false, false);

                pageIndex++;
                numWordCreated++;
                sideNumCreated++;
            }
            lastWordIndex = pageIndex-1;

            sideNumCreated = 0;
            pageIndex = _pageIndex-1;
            while(sideNumCreated < SIDE_BLOCK_SIZE && pageIndex >= 1)
            {
                createWord(pageIndex, true, false);

                pageIndex--;
                numWordCreated++;
                sideNumCreated++;
            }
            firstWordIndex = pageIndex+1;

            if(lastWordIndex <= _numPages)
            {
                pageIndex = lastWordIndex+1;
                while(numWordCreated < BLOCK_SIZE && pageIndex <= _numPages)
                {
                    createWord(pageIndex, false, false);

                    pageIndex++;
                    numWordCreated++;
                }
                lastWordIndex = pageIndex-1;
            }

            if(firstWordIndex >= 1)
            {
                pageIndex = firstWordIndex-1;
                while(numWordCreated < BLOCK_SIZE && pageIndex >= 1)
                {
                    createWord(pageIndex, true, false);

                    pageIndex--;
                    numWordCreated++;
                }
                firstWordIndex = pageIndex+1;
            }

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
(function ()
{
    var $doms = {},
        _isHiding = true,
        _isLocking = false,
        _entryData,
        _searchSetting;

    var self = window.EntryView =
    {
        init: function ()
        {
            $doms.parent = $("#scene-container");
            $doms.container = $('#entry-view');

            $doms.imagePreview = $doms.container.find(".image-preview");


            $doms.optionalFields = $doms.container.find(".optional-fields");

            $doms.arrowLeft = $doms.container.find(".arrow-left").on("click", function()
            {
                if(_isLocking) return;
                if(_searchSetting)
                {
                    _searchSetting.page_index--;
                    if(_searchSetting.page_index < 0) _searchSetting.page_index = 0;
                    self.showEntryAt(_searchSetting);
                }
            });

            $doms.arrowRight = $doms.container.find(".arrow-right").on("click", function()
            {
                if(_isLocking) return;
                if(_searchSetting)
                {
                    _searchSetting.page_index++;
                    if(_searchSetting.page_index >= _searchSetting.num_pages) _searchSetting.page_index = _searchSetting.num_pages - 1;
                    self.showEntryAt(_searchSetting);
                }

            });

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

            $doms.btnToList = $doms.container.find(".btn-to-list").on("click", function()
            {
                self.hide();
            });

            $doms.btnVote = $doms.container.find(".btn-vote").on("click", function()
            {
                self.hide();
                //console.log("serial = " + _entryData.serial);
                CommonForm.setVotingSerial(_entryData.serial);
                Entries.toStep("vote");
            });


            $doms.container.detach();
        },
        showPreview: function(canvas, description)
        {
            $doms.imagePreview.empty();
            $doms.imagePreview.append(canvas);

            $doms.fields.description.text(description);

            toPreviewMode();
            self.show();
        },
        showEntry: function(entryData, isMultipleMode)
        {
            _entryData = entryData;


            var image = document.createElement("img");
            image.src = entryData.url;

            $doms.imagePreview.empty();
            $doms.imagePreview.append(image);

            $doms.fields.description.text(entryData.description);
            $doms.fields.numVotes.text(entryData.num_votes);
            $doms.fields.author.text(entryData.name);
            $doms.fields.serial.text(entryData.serial);

            toEntryMode(isMultipleMode);
            self.show();

        },

        showEntryAt: function(searchSetting)
        {
            _searchSetting = searchSetting;

            _isLocking = true;
            Loading.progress("資料讀取中...").show();

            ApiProxy.callApi("entries_search", searchSetting, "entries_search.single", function(response)
            {
                TweenMax.delayedCall(.5, function()
                {
                    if(response.error)
                    {
                        alert(response.error);
                    }
                    else
                    {
                        //console.log("response = " + JSON.stringify(response));

                        _searchSetting.num_pages = parseInt(response.num_pages);

                        self.showEntry(response.data[0], true);

                        _isLocking = false;
                        Loading.hide();
                    }
                });
            });

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

        $doms.arrowLeft.css("display", 'none');
        $doms.arrowRight.css("display", 'none');

        setVoteButtons(false);
    }

    function toEntryMode(isMultipleMode)
    {
        $doms.optionalFields.toggleClass("hidding", false);

        if(isMultipleMode)
        {
            $doms.arrowLeft.css("display", 'block');
            $doms.arrowRight.css("display", 'block');

            if(_searchSetting)
            {
                $doms.arrowLeft.css("visibility", "visible");
                $doms.arrowRight.css("visibility", "visible");

                if(_searchSetting.page_index <= 0)
                {
                    $doms.arrowLeft.css("visibility", "hidden");
                }

                if(_searchSetting.page_index >= (_searchSetting.num_pages-1))
                {
                    $doms.arrowRight.css("visibility", "hidden");
                }
            }

        }
        else
        {
            $doms.arrowLeft.css("display", 'none');
            $doms.arrowRight.css("display", 'none');
        }

        setVoteButtons(true);
    }

    function setVoteButtons(showIt)
    {
        if(showIt)
        {
            $doms.btnToList.toggleClass("hidding", false);
            $doms.btnVote.toggleClass("hidding", false);
        }
        else
        {
            $doms.btnToList.toggleClass("hidding", true);
            $doms.btnVote.toggleClass("hidding", true);
        }
    }

}());

(function ()
{
    var $doms = {},
        _isHiding = true,
        _imageInput = {},
        _isImageReady = false,
        _isDescriptionReady = false,
        _isRuleConfirmed = false,
        _imageSetting =
        {
            raw: {w:1200, h:900},
            preview: {w:474, h:356},
            thumb: {w:133, h:100}
        };

    var self = window.Participate.UploadStep =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.textArea = $doms.container.find(".description");
            setupTextArea($doms.textArea);

            //console.log($doms.textArea.defaultText);
            setupImageInput();


            $doms.btnRule = $doms.container.find(".btn-rule").on("click", function()
            {
                SceneHandler.toHash("/Rule");
            });

            $doms.ruleCheckbox = $doms.container.find("#upload-checkbox").on("change", function()
            {
                ga("send", "event", "parttime", "click", "parttime_agreement_artwork");
                update();
            });

            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {
                ga("send", "event", "parttime", "click", "parttime_send_now");


                if(!_isImageReady)
                {
                    alert("請先選擇欲上傳的圖片");
                }
                else if(!_isDescriptionReady)
                {
                    alert("請輸入 20 個字元以上的作品說明");
                }
                else if(!_isRuleConfirmed)
                {
                    alert("您必須同意我們的活動辦法");
                }
                else
                {
                    Participate.toStep("form");
                }
            });

            $doms.btnPreview = $doms.container.find(".btn-preview").on("click", function()
            {
                ga("send", "event", "parttime", "click", "preview");

                if(!_isImageReady)
                {
                    alert("請先選擇欲上傳的圖片");
                }
                else
                {
                    EntryView.showPreview(self.getPreviewCanvas(), self.getDescriptionInput());
                }
            });

            $doms.container.detach();
        },
        show: function (delay, cb)
        {
            if(!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);

            update();

            if(delay === undefined) delay = 0;

            var tl = new TimelineMax;
            tl.set($doms.container, {autoAlpha: 0, marginLeft:100});
            tl.to($doms.container, .4, {autoAlpha: 1, marginLeft: 0}, delay);
            tl.add(function ()
            {
                if(cb) cb.apply();
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
                if(cb) cb.apply();
            });

        },

        getDescriptionInput: function()
        {
            var text = $doms.textArea.val();
            if(text == $doms.textArea.defaultText) text = '';
            return text;
        },

        getRawCanvas: function()
        {
            return self.getCanvas("raw");
        },

        getPreviewCanvas: function()
        {
            return self.getCanvas("preview");
        },

        getThumbCanvas: function()
        {
            return self.getCanvas("thumb");
        },

        getImage: function()
        {
            return _imageInput.image;
        },

        getCanvas: function(keyword)
        {
            var canvasName = keyword + "Canvas";
            if(!_imageInput[canvasName])
            {
                if(!_imageInput.image) return null;

                var size = _imageSetting[keyword];
                _imageInput[canvasName] = Helper.imageToCanvas(_imageInput.image, size.w, size.h);

                //_imageInput[canvasName].className = "canvas-test";
                //$("#scene-container").append(_imageInput[canvasName]);
            }

            return _imageInput[canvasName];

        }
    };


    function update()
    {
        _isImageReady = self.getImage()? true: false;
        _isDescriptionReady = (self.getDescriptionInput().length >= 20);
        _isRuleConfirmed = $doms.ruleCheckbox[0].checked;

        var activeBtnSend = (_isImageReady && _isDescriptionReady && _isRuleConfirmed);

        $doms.btnSend.toggleClass("disactivated", !activeBtnSend);
        $doms.btnPreview.toggleClass("disactivated", !_isImageReady);
    }

    function setupTextArea($dom)
    {
        $dom.defaultText = $dom.val();

        $dom.on("focus", function()
        {
            if($dom.val() == $dom.defaultText)
            {
                $dom.val("");
            }
        }).on("blur", function()
        {
            if($dom.val() == '')
            {
                $dom.val($dom.defaultText);
            }
        }).on("input propertychange", function()
        {
            update();
            //console.log("changed");
        });
    }

    function setupImageInput()
    {
        var inputDom = $doms.container.find(".image-input")[0];


        $doms.btnSelectImage = $doms.container.find(".btn-upload").on("click",   function()
        {

            ga("send", "event", "parttime", "click", "upload");

            inputDom.value = null;
            inputDom.click();
        });



        $(inputDom).on("change", function()
        {
            Loading.progress('empty').show();
            loadFile(inputDom, function()
            {
                update();
                Loading.hide();
            });

        });

        function loadFile(inputDom, cb)
        {
            if (inputDom.files && inputDom.files[0])
            {

                //console.log(_imageInput.input.files[0].size);
                var reader = new FileReader();

                reader.onload = function (event)
                {
                    loadImg(event.target.result, cb);
                };

                reader.readAsDataURL(inputDom.files[0]);
            }
        }

        function loadImg(src, cb)
        {
            if(_imageInput.image)
            {
                $(_imageInput.image).detach();
                _imageInput.image = null;
            }
            if(_imageInput.rawCanvas)
            {
                $(_imageInput.rawCanvas).detach();
                _imageInput.rawCanvas = null;
            }
            if(_imageInput.previewCanvas)
            {
                $(_imageInput.previewCanvas).detach();
                _imageInput.previewCanvas = null;
            }
            if(_imageInput.thumbCanvas)
            {
                $(_imageInput.thumbCanvas).detach();
                _imageInput.thumbCanvas = null;
            }

            _imageInput.image = document.createElement("img");

            _imageInput.image.onload = function()
            {
                if(_imageInput.image.width != _imageSetting.raw.w || _imageInput.image.height != _imageSetting.raw.h)
                {
                    var string = "您所上傳的圖片尺寸 ( "+_imageInput.image.width+" x "+_imageInput.image.height+" ) "+
                        "和我們的作品規格 ( "+_imageSetting.raw.w+" x "+_imageSetting.raw.h+" ) 不同\n\n將自動裁切或縮放, 請預覽圖片確定內容是否正確.";
                    alert(string);
                }

                //console.log(self.getRawCanvas().toDataURL("image/jpeg", .95).replace(/^data:image\/jpeg;base64,/, ""));

                if(cb) cb.call();
            };

            _imageInput.image.src = src;
        }
    }

}());


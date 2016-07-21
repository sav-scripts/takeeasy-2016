(function ()
{
    var $doms = {},
        _isInit = false,
        _currentStep = 'upload',
        _stepDic;

    var self = window.Participate =
    {
        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(cb);
            }

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_participate.html", startWeight: 0, weight: 100, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);
                    _isInit = true;
                    cb.apply(null);
                }, 0);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        toStep: function(step)
        {
            if(step == _currentStep) return;

            _stepDic[_currentStep].hide();

            _currentStep = step;

            if(_currentStep == "form")
            {
                CommonForm.setMode("participate");
                //self.UploadStep.hide(0, CommonForm.show);
            }

            _stepDic[_currentStep].show();
        },

        resize: function (width, height, scale)
        {

        }
    };

    function build(templates)
    {
        _stepDic =
        {
            "upload": self.UploadStep,
            "form": CommonForm
        };

        $("#invisible-container").append(templates[0].dom);

        $doms.container = $("#participate");

        self.UploadStep.init($doms.container.find(".content-step-upload"));
        self.Title.init($doms.container.find(".content-title"));
        self.Success.init($("#participate-success"));

        $doms.container.detach();
    }

    function show(cb)
    {
        if(!Main.settings.fbToken)
        {
            cb.apply();
            //SceneHandler.toHash("/Index");
            return;
        }

        $("#scene-container").append($doms.container);

        _currentStep = 'upload';
        self.Title.show();
        self.UploadStep.show(0, function()
        {
            //self.Success.show();
            cb.apply();

        });



        //_currentStep = 'form';
        //self.Title.show();
        //CommonForm.show(0, cb);
    }

    function hide(cb)
    {
        _stepDic[_currentStep].hide();

        self.Title.hide(0, function()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

}());

(function ()
{
    var $doms = {},
        _isHiding = true;

    window.Participate.Title =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.container.detach();
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

        }
    };

}());

(function ()
{
    var $doms = {},
        _isHiding = true,
        _imageInput = {},
        _isImageReady = false,
        _isDescriptionReady = false,
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



            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {

                if(!_isImageReady)
                {
                    alert("請先選擇欲上傳的圖片");
                }
                else if(!_isDescriptionReady)
                {
                    alert("請輸入 20 個字元以上的作品說明");
                }
                else
                {
                    Participate.toStep("form");
                }
            });

            $doms.btnPreview = $doms.container.find(".btn-preview").on("click", function()
            {
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
            tl.set($doms.container, {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1}, delay);
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

        var activeButtons = (_isImageReady && _isDescriptionReady);

        $doms.btnSend.toggleClass("disactivated", !activeButtons);
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


        $doms.btnSelectImage = $doms.container.find(".btn-upload").on("click", selectFile);

        function selectFile()
        {
            inputDom.value = null;
            inputDom.click();
        }

        $(inputDom).on("change", function()
        {
            //_imageInput.imageReady = false;

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
                //console.log("image ready");

                //self.getThumbCanvas();

                if(cb) cb.call();

                //_imageInput.canvas = imageToCanvas(_imageInput.image, _imageSetting.rw, _imageSetting.rh);
                //$doms.container.append(_imageInput.canvas);
            };

            _imageInput.image.src = src;
        }
    }

}());


(function ()
{
    var $doms = {},
        _isHiding = true;

    var self = window.Participate.Success =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $("body");

            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
                self.hide();

                SceneHandler.toHash("/Index");
            });

            $doms.btnShare = $doms.container.find(".btn-share").on("click", function()
            {
                Main.loginFB(function()
                {
                    FB.ui
                    (
                        {
                            method:"share",
                            display: "iframe",
                            href: Utility.getPath()
                        },function(response)
                        {
                            if(!response.error)
                            {
                                self.hide();
                                SceneHandler.toHash("/Index");
                            }
                        }
                    );
                });

            });

            $doms.container.detach();
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

}());
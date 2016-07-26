/**
 * Created by sav on 2016/7/25.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _illustIndex,
        _isLocking = false,
        NUM_ILLUSTS = 9,
        _illusts = [],
        _focusIllust = null,
        _gapSetting =
        {
            0:{
                wGap:100,
                wrapSize:1,
                duration:.4
            },
            1:{
                wGap:366,
                wrapSize: 3,
                duration:.8
            }
        };

    var self = window.Fill.IllustList =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.listContainer = $doms.container.find(".list-container");

            $doms.arrowLeft = $doms.container.find(".arrow-left").on("click", function()
            {
                var wrapSize = _gapSetting[Main.settings.viewport.index].wrapSize;

                self.toIllust(_illustIndex - wrapSize);
            });

            $doms.arrowRight = $doms.container.find(".arrow-right").on("click", function()
            {
                var wrapSize = _gapSetting[Main.settings.viewport.index].wrapSize;

                self.toIllust(_illustIndex + wrapSize);

            });

            for(var i=0;i<NUM_ILLUSTS;i++)
            {
                _illusts[i] = new self.Illust(i, parseInt(i/3)+1, $doms.container.find(".illust:nth-child("+(i+1)+")"), focusOnIllust);
            }


            $doms.container.detach();
        },
        show: function (delay, cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);



            for(var i=0;i<_illusts.length;i++)
            {
                _illusts[i].textToCanvas();
            }


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

        toIllust: function(index, duration)
        {
            if(_isLocking) return;
            if(_illustIndex === index) return;
            if(index < 0 || index >= NUM_ILLUSTS) return;

            _isLocking = true;

            _illustIndex = index;

            updateArrows();

            if(duration === undefined) duration = _gapSetting[Main.settings.viewport.index].duration;

            var viewportIndex = Main.settings.viewport.index,
                wGap = _gapSetting[viewportIndex].wGap,
                tx = -wGap * _illustIndex;

            var tl = new TimelineMax;
            tl.to($doms.listContainer, duration, {left:tx, ease:Power1.easeInOut});
            tl.add(function()
            {
               _isLocking = false;
            });
        }
    };

    function updateArrows()
    {
        var wrapSize = _gapSetting[Main.settings.viewport.index].wrapSize;

        $doms.arrowLeft.toggleClass("hidding", (_illustIndex <= 0));
        $doms.arrowRight.toggleClass("hidding", (_illustIndex >= (NUM_ILLUSTS-wrapSize)));
    }

    function focusOnIllust(illust)
    {
        if(_focusIllust == illust) illust = null;

        if(_focusIllust)
        {
            _focusIllust.close();
        }

        _focusIllust = illust;

        if(_focusIllust)
        {
            _focusIllust.open();
        }
    }

}());

(function(){

    window.Fill.IllustList.Illust = Illust;

    function Illust(index, illustratorIndex, $container, onTrigger)
    {
        var self = this;

        this._onTrigger = onTrigger;

        this.index = index;
        this.illustratorIndex = illustratorIndex;
        this.$container = $container;

        this.$input = $container.find(".field-input").on("input", function()
        {
            var text =  self.$input.val();
            self.$btnSend.toggleClass("disactivated", text.length == 0);
            self.textToCanvas();
        });

        this.$inputBound = $container.find(".fill-bound").val('請輸入十個以內的文字');


        this.$btnSend = $container.find(".btn-send").toggleClass('disactivated', true).on("click", function()
        {
            var text =  self.$input.val();
            if(text == '')
            {
                alert('請先輸入對話文字');
            }
            else
            {
                Fill.setSendingIllust(self);

                //var canvas = Fill.getSendingCanvas();
                //$(canvas).css("z-index", 6000).css("position", "absolute");
                //$("body").append(canvas);

                Fill.toStep("form");

            }
        });

        var imageUrl = $container.css("background-image").replace('url("', '').replace('")', '');
        this.image = document.createElement("img");
        var $image = $(this.image).css("cursor", 'pointer');
        this.image.onload = function()
        {
            $image.on("click", triggerInput);
        };
        this.image.src = imageUrl;


        function triggerInput()
        {
            if(onTrigger) onTrigger.call(null, self);
        }


        $container.css("background-image", 'none');

        this.$container.append(this.image);
    }

    Illust.prototype =
    {
        index: null,
        illustratorIndex: null,
        image:null,
        $container: null,
        $input: null,
        $inputBound: null,
        $btnSend: null,
        textCanvas: null,
        textCtx: null,

        _isOpen: false,
        _oldText: null,
        _onTrigger: null,

        open: function()
        {
            if(this._isOpen) return;
            this._isOpen = true;

            this.$container.toggleClass("open-mode", true);
            this.$inputBound.toggleClass("open-mode", true);

            this.$input.focus();

            this.textToCanvas();
        },

        close: function()
        {
            if(!this._isOpen) return;
            this._isOpen = false;

            this.$container.toggleClass("open-mode", false);

            this.$inputBound.toggleClass("open-mode", (this.$input.val().length > 0));
        },

        textToCanvas: function()
        {
            var horizontalModeIllusts =
            {
                3: true,
                8: true
            };

            var self = this;


            var $textarea = this.$inputBound;

            if(!this.textCtx)
            {
                var newCanvas = this.textCanvas = document.createElement('canvas'),
                    left = parseInt($textarea.css("left")),
                    top = parseInt($textarea.css("top"));


                this.textCanvas.startLeft = this.textCanvas.finalLeft = left;
                this.textCanvas.startTop = this.textCanvas.finalTop = top;

                newCanvas.width = parseInt($textarea.css("width"));
                newCanvas.height = parseInt($textarea.css("height"));

                $(newCanvas).css("position", "absolute").css("left", left).css("top", top).css("z-index", 19)
                    .css("cursor", "pointer").on("click", function()
                {
                    self._onTrigger.call(null, self);
                });

                this.textCtx = newCanvas.getContext("2d");

                this.$container.append(this.textCanvas);
            }


            var text = this.$input.val(),
                width = this.textCanvas.width,
                height = this.textCanvas.height,
                fontSize = parseInt($textarea.css("font-size")),
                lineHeight = parseInt($textarea.css("line-height")),
                fontFamily = $textarea.css("font-family"),
                isHorizontalInput = horizontalModeIllusts[this.index];

            if(text.length == 0)
            {
                this.textCtx.fillStyle = 'rgba(0,0,0,.3)';
                text = '請輸入十個以內的文字';
            }
            else
            {
                this.textCtx.fillStyle = '#000000';
            }

            if(this._oldText === text) return;
            this._oldText = text;

            this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);

            var i,
                ctx = this.textCtx,
                startX,
                startY,
                letter;

            ctx.font = fontSize + "px " + fontFamily;

            if(isHorizontalInput)
            {
                startX = 0;
                startY = fontSize - 3;
            }
            else
            {
                startX = width - fontSize - 2;
                startY = fontSize - 3;
            }

            for(i=0;i<text.length;i++)
            {
                letter = text[i];

                //console.log("startX = " + startX + ", startY = " + startY);
                //console.log("letter = " + letter);

                ctx.fillText(letter, startX, startY);

                if(isHorizontalInput)
                {
                    startX += fontSize;

                    if(startX > (width - fontSize))
                    {
                        startX = 0;
                        startY += lineHeight;
                    }
                }
                else
                {
                    startY += fontSize;

                    if(startY > height)
                    {
                        startY = fontSize - 3;
                        startX -= lineHeight;
                    }
                }
            }

            var bound = Helper.getContextBoundingBox(ctx);

            if(bound)
            {
                this.textCanvas.finalLeft = this.textCanvas.startLeft - bound.x + (width-bound.w)*.5;
                this.textCanvas.finalTop = this.textCanvas.startTop - bound.y + (height-bound.h)*.5;

                $(this.textCanvas).css("left", this.textCanvas.finalLeft).css('top', this.textCanvas.finalTop);
            }
        },

        getOutputCanvas: function()
        {
            var canvas = Helper.imageToCanvas(this.image, this.image.width, this.image.height);

            $(canvas).css("z-index", 6000).css("position", "absolute");

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this.textCanvas, this.textCanvas.finalLeft, this.textCanvas.finalTop);

            return canvas;
        }
    };





}());
(function ()
{
    var $doms = {},
        _isHiding = true,
        _currentMode = null;

    window.CommonForm =
    {
        init: function ()
        {
            $doms.parent = $("#scene-container");
            $doms.container = $('#common-form');

            $doms.eulaContentContainer = $doms.container.find(".content-container");

            var containerHeight = $doms.eulaContentContainer.height();
            var ss = new SimpleScroller($doms.eulaContentContainer[0], null, 0, Modernizr.touchevents).update(true);

            var $ssContainer = $(ss.doms.container);
            ss.containerSize(null, containerHeight).scrollBound($ssContainer.width()-21, 0, 0, containerHeight-38).update(true);

            $doms.fields =
            {
                name: $doms.container.find(".field-name"),
                phone: $doms.container.find(".field-phone"),
                email: $doms.container.find(".field-email"),
                ruleCheck: $doms.container.find('#eula-checkbox')
            };

            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {
                trySend();
            });

            $doms.container.detach();
        },
        show: function (delay, cb)
        {
            if(!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);

            reset();

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

        },

        setMode: function(mode)
        {
            _currentMode = mode;
        }
    };

    function reset()
    {
        $doms.fields.name.val('');
        $doms.fields.phone.val('');
        $doms.fields.email.val('');
        $doms.fields.ruleCheck[0].checked = false;
    }

    function trySend()
    {
        var formObj = checkForm();

        if(formObj)
        {
            if(_currentMode == "participate")
            {
                //Participate.Success.show();
                var canvas = Participate.UploadStep.getRawCanvas(),
                    imageData;
                if(canvas)
                {
                    imageData = canvas.toDataURL("image/jpeg", .95).replace(/^data:image\/jpeg;base64,/, "");

                    formObj.image_data = imageData;
                    formObj.description = Participate.UploadStep.getDescriptionInput();

                    Loading.progress('資料傳輸中 ... 請稍候').show();

                    ApiProxy.callApi("participate", formObj, function(response)
                    {
                        if(response.error)
                        {
                            alert(response.error);
                        }
                        else
                        {
                            console.log("success");
                        }

                        Loading.hide();
                    });

                }
                else
                {
                    alert('lack image data');
                }

            }
            else
            {
                alert("lack necessary data");
            }
        }
    }

    function checkForm()
    {
        var formObj={};
        var dom;

        if(!$doms.fields.ruleCheck.prop("checked"))
        {
            alert('您必須同意 "授權主辦單位使用本人個人資料" 才能參加活動');
            return;
        }

        dom = $doms.fields.name[0];
        if(PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的名稱'); dom.focus(); return;
        }else formObj.name = dom.value;

        dom = $doms.fields.phone[0];
        if(!PatternSamples.phone.test(dom.value))
        {
            alert('請輸入正確的手機號碼'); dom.focus(); return;
        }
        else formObj.phone = dom.value;

        dom = $doms.fields.email[0];
        if(!PatternSamples.email.test(dom.value))
        {
            alert('請輸入您的電子郵件信箱'); dom.focus(); return;
        }
        else formObj.email = dom.value;

        formObj.fb_uid = Main.settings.fbUid;
        formObj.fb_token = Main.settings.fbToken;

        //formObj.paint_data = CanvasProxy.getBase64JPEG();

        return formObj;

    }

}());
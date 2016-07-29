/**
 * Created by sav on 2016/7/29.
 */
(function(){

    var $doms = {},
        _radialRadius = 3600,
        _tl= null,
        $flashingBeams = [],
        _flashingColor = "#f7e8b5",
        _beamColor = "#f7e08f",
        _isFlashing = false,
        _tweenObj =
        {
            deg:0,
            index : 0
        };

    var self = window.RadialBackground =
    {
        init: function()
        {
            $doms.container = $("#radial-background");


            //createBoomCircle();


            self.update();


            _tl = new TimelineMax({repeat:-1, paused:true});
            _tl.add(function()
            {
                self.generateFlash();
            },.03);

            //self.startFlash();

            $(document).on("mousedown", function()
            {
                self.boom();
            });
        },

        startFlash: function()
        {
            if(_isFlashing) return;
            _isFlashing = true;

            _tl.resume();
        },

        stopFlash: function()
        {
            if(!_isFlashing) return;
            _isFlashing = false;

            _tl.pause();
            clearFlash();
        },

        boom: function(speedScale)
        {
            if(!_isFlashing) return;

            if(speedScale === undefined) speedScale = 1;

            var $boom = createBoomCircle();

            var tl = new TimelineMax();
            tl.set($boom, {scale:0, transformOrigin:"50% 50%"});
            tl.to($boom, 1*speedScale, {scale: 2, ease:Power1.easeInOut});
            tl.to($boom,.3*speedScale, {alpha: 0}, "-="+ (.3*speedScale));
            tl.add(function()
            {
               $boom.detach();
            });
        },

        generateFlash: function()
        {
            var minWrap = 2,
                wrapRange = 5,
                index = parseInt(Math.random()*5),
                $dom;

            clearFlash();

            while(index < $doms.beams.length)
            {
                $dom = $($doms.beams[index]);

                $dom.css("fill", _flashingColor);

                //TweenMax.to($dom, 1, {fill: "#ffffff"});

                $flashingBeams.push($dom);

                //index += minWrap + parseInt(Math.random()*wrapRange);
                index += minWrap + parseInt(Math.random()*wrapRange);
            }

        },

        update: function()
        {
            var startDeg = _tweenObj.deg,
                degSize = 5,
                degGap = degSize + 5,
                deg;

            var p0, p1, p2,
                arc1,
                arc2;

            for(deg=(startDeg-degSize *.5);deg<(startDeg+360-degSize *.5);deg+=degGap)
            {
                // <polygon style="fill:#F1CD6C;" points="509.775,0 600.541,599.992 545.759,0 	"/>

                arc1 = Math.PI/180*deg;
                arc2 = Math.PI/180*(deg+degSize);

                p0 = "0,0 ";
                p1 = _radialRadius * Math.cos(arc1) + "," + _radialRadius * Math.sin(arc1) + " ";
                p2 = _radialRadius * Math.cos(arc2) + "," + _radialRadius * Math.sin(arc2) + " ";

                var dom = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

                $(dom).css("fill", _beamColor).attr("points", p0+p1+p2);

                $doms.container.append(dom);
            }

            $doms.beams = $doms.container.find("polygon");
        },

        onResize: function()
        {

        }
    };

    function createBoomCircle()
    {
        var $dom = $(document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'))
            .attr("cx", 0).attr("cy", 0).attr("rx", 300).attr("ry", 300)
            .attr("fill", "url(#grad1)");

        $doms.container.prepend($dom);

        return $dom;

        //TweenMax.set($doms.boomCircle, {scale:.5, transformOrigin: '50% 50%'});

    }

    function clearFlash()
    {
        var i, $dom;

        for(i=0; i<$flashingBeams.length; i++)
        {
            $dom = $flashingBeams[i];
            $dom.css("fill", _beamColor);
        }

        $flashingBeams = [];
    }

}());
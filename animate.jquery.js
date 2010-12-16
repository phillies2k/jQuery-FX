/**
 * jQuery FX v1.1.0
 * 
 * jQuery plugin which enhances jQuery with the power of CSS3 properties to be
 * used in a native, familiar way. This plugins publishes css3 properties through
 * the css and animation framework of jquery, so that they can be used in every
 * animation or just in a simple .css() call.
 *
 * @author Philipp Boes pb@mostgreedy.com
 * @see https://github.com/phillies2k/jQuery-FX/
 *
 * @version $Id$
 *
 */

(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){
    d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);
    g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),
                                                            Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),
                                                            Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)]
    .join(",")+")"}});
 
 function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);

(function($){
    
    var transformPropertyNames          = ['transform', 'WebkitTransform', 'MozTransform', 'msTransform', 'OTransform'],
        transformMethodNames            = ['rotate', 'scale', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY', 'translate', 'translateX', 'translateY'],
        transformMethodUnits            = ['deg', '', '', '', 'deg', 'deg', 'deg', 'px', 'px', 'px'],
        transformMethodDefaults         = [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        
        jQueryCSSProxy                  = $.fn.css,
        jQueryCurProxy                  = $.fx.prototype.cur,
        
        units                           = {},
        defaults                        = {},
        
        PATTERN_MATCH_PROPVALUE         = /^([+-]=*)*(\d+(\.\d+)*)([^\s,]*)((,\s*)([+-]=*)*(\d+(\.\d+)*)(.+)*)*$/,
        propertyPatterns                = {
            rotate      : /rotate\(([^\)]*)\)/,
            scale       : /scale\(([^\)]*)\)/,
            scaleX      : /scaleX\(([^\)]*)\)/,
            scaleY      : /scaleY\(([^\)]*)\)/,
            skew        : /skew\(([^\)]*)\)/,
            skewX       : /skewX\(([^\)]*)\)/,
            skewY       : /skewY\(([^\)]*)\)/,
            translate   : /translate\(([^\)]*)\)/,
            translateX  : /translateX\(([^\)]*)\)/,
            translateY  : /translateY\(([^\)]*)\)/,
                        
                        // matrix(scaleX, pX, pY, scaleY, oX, oY)
            matrix      : /matrix\(([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\)/
        };
    
    for (i=0;i<transformMethodNames.length;i++){ units[transformMethodNames[i]] = transformMethodUnits[i]; defaults[transformMethodNames[i]] = transformMethodDefaults[i]; }
    
    function getTransformPropertyName( elem ) {
        var p;
        for (p in transformPropertyNames) {
            if (typeof elem.style[transformPropertyNames[p]] != 'undefined') {
                return transformPropertyNames[p];
            }
        }
        return 'transform';
    }
    
    function transformExpressionValue( prop, val, style ) {
        var s = typeof style != 'undefined' ? style : (jQuery.style(this.get(0), $.props['transform']) || ''),
            m = s.match(propertyPatterns[prop]),
            n = typeof val != 'undefined' ? val.toString().match(PATTERN_MATCH_PROPVALUE) : null,
            a, a1, a2, b, p;
            
        if (n) {
            
            a = n[1] ? n[1] : n[7] ? n[7] : false;
            
            switch (a) {
                case '-':
                    a1 = parseFloat(n[1] + n[2]);
                    break;
                case '-=':
                    a1 = ((m[2] ? -1 : 1) * m[2]) - n[2];
                    break;
                case '+=':
                    a1 = n[2] + ((m[2] ? -1 : 1) * m[2]);
                    break;
                default:
                    a1 = n[2];
                    if (n[8]) a2 = n[8];
            }
            
            if ((prop == 'skew' || prop == 'translate') && !a2) a2 = a1;
            
            p = prop + '(' + a1 + units[prop] + (typeof a2 != 'undefined' ? ', ' + a2 + units[prop] : '') + ')';
            return m ? s.replace(propertyPatterns[prop], p) : s + p;
            
        } else {
            return m ? m[1] : defaults[prop];
        }
    };
    
    $.fn.css = function( arg, val ) {
        
        if ((typeof $.props['transform'] == 'undefined' && typeof arg == 'string' && (arg == 'transform' || jQuery.inArray(arg, transformMethodNames))) || typeof arg == 'object') {
            $.props['transform'] = getTransformPropertyName(this.get(0));
        }
        
        if ($.props['transform'] != 'transform') {
            if (typeof arg == 'string' && (arg == 'transform' || arg == 'rotate' || jQuery.inArray(arg, transformMethodNames))) {
                if (arg != 'transform' && jQuery.style) {
                    val = transformExpressionValue.apply(this, [arg, val]);
                    arg = $.props['transform'];
                } else {
                    return jQuery.style(this.get(0), $.props['transform']) || defaults[arg];
                }
            } else if (typeof arg == 'object') {
                var prop;
                for (prop in arg) {
                    if (jQuery.inArray(prop, transformMethodNames)) {
                        arg['transform'] = transformExpressionValue.apply(this, [prop, arg[prop], arg['transform']]);
                        delete arg[prop];
                    }
                }
                
                if (typeof arg['transform'] != 'undefined') {
                    arg[$.props['transform']] = arg['transform'];
                    delete arg['transform'];
                }
            }
        }
        
        return jQueryCSSProxy.apply(this, arguments);
    };
    
    jQuery.each(transformMethodNames, function( index, name ){
        jQuery.fx.step[ name ] = function( fx ) {
            
            if (!fx.animInit) {
                fx.unit = units[ fx.prop ];
                fx.start = parseFloat(jQuery.css( fx.elem, fx.prop)) || defaults[ fx.prop ];
                fx.pos = fx.start;
                fx.animInit = true;
            }
            
            return $(fx.elem).css( fx.prop, fx.now );
        }
    });
    
})(jQuery);
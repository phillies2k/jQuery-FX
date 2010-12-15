/**
 * jQuery FX CSS3 v1.0.0
 * 
 * jQuery plugin which enhances jQuery with the power of CSS3 properties to be
 * used in a native, familiar way. This plugins publishes css3 properties through
 * the css and animation framework of jquery, so that they can be used in every
 * animation or just in a simple .css() call.
 *
 * @author Philipp Boes pb@mostgreedy.com
 * @see http://github.com/phillies2k/jQuery-FX-CSS3/
 *
 * @version $Id$
 *
 */

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
            translateY  : /translateY\(([^\)]*)\)/
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
            a, a1, a2, p;
        
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
            if (typeof arg == 'string' && (arg == 'transform' || arg == 'rotate'|| jQuery.inArray(arg, transformMethodNames))) {
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
    
    $.fx.step.skew = $.fx.step.skewX = $.fx.step.skewY = 
    $.fx.step.scale = $.fx.step.scaleX = $.fx.step.scaleY = 
    $.fx.step.translate = $.fx.step.translateX = $.fx.step.translateY =
    $.fx.step.rotate = function(fx) {
        return $(fx.elem).css(fx.prop, fx.now);
    };
    
    $.fx.prototype.cur = function() {
        if (jQuery.inArray(this.prop, transformMethodNames)) this.unit = units[this.prop];
        return jQueryCurProxy.apply(this, arguments);
    }
    
})(jQuery);
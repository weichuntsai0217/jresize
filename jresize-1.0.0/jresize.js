/*!
 * jQuery Plugin: jresize.js v1.0.0
 *
 * Copyright (c) 2015 Jimmy Tsai
 */
(function($) {
	var draggerDefaults = {
        'dragger': 'dragger',
        'draggerDragging': 'dragging',
        'initX':'',
        'initY':''
	};
	var resizerDefaults = {
        'resizer': 'resizer',
        'resizerContent': 'resizer-content',
        'resizerControl': 'resizer-control',
        'resizerResizing': 'resizing',
        'resizerEast':'resizer-e',
        'resizerSouth':'resizer-s',
        'resizerWest':'resizer-w',
        'resizerNorth':'resizer-n',
        'resizerNE':'resizer-ne',
        'resizerSE':'resizer-se',
        'resizerSW':'resizer-sw',
        'resizerNW':'resizer-nw',
        'minWidth': '20',
        'minHeight': '20',
        'enableEast': true,
        'enableSouth': true,
        'enableWest': true,
        'enableNorth': true,
        'enableNE': true,
        'enableSE': true,
        'enableSW': true,
        'enableNW': true,
        'aspectRatio': false,
        'initWidth': '',
        'initHeight': ''
	};
	function getPixel(number) {
        if ( (typeof number) === 'number' ) {
            return (number.toString() + 'px');
        } else if ( (typeof number) === 'string' ) {
            return (number + 'px');
        } else {
            return '0px';
        }
    };
	function getClass(str) {
        return '.' + str;
	};
    function setLayout(target, pos, size){
        target.offset({
            'left': pos.x,
            'top': pos.y
        });
        target.css({
            'width': getPixel(size.width),
            'height': getPixel(size.height),
        });
    };
    function getPos(target, x, y) {
        var pos = {'x':'nodefined', 'y':'nodefined'};
        if ( (typeof x !== 'undefined') && (typeof y !== 'undefined') && ( x !== '' ) && ( y !== '' ) && ( !isNaN(parseFloat(x)) ) && ( !isNaN(parseFloat(y)) ) ){
            pos.x = parseFloat(x);
            pos.y = parseFloat(y);
        } else {
            pos.x = target.offset().left;
            pos.y = target.offset().top;
        }
        return pos;
    };
    function getSize(target, width, height) {
        var size = {'width':'nodefined', 'height':'nodefined'};
        if ( (typeof width !== 'undefined') && (typeof height !== 'undefined') && ( width !== '' ) && ( height !== '' ) && ( !isNaN(parseFloat(width)) ) && ( !isNaN(parseFloat(height)) ) ){
            size.width = parseFloat(width);
            size.height = parseFloat(height);
        } else {
            size.width = target[0].width;
            size.height = target[0].height;
        }
        return size;
    };
	$.extend($.fn, {
		drag: function(options) {
			var settings = $.extend(true, {}, resizerDefaults, draggerDefaults, options),
                target = $(this);
            var tagName = target.prop('tagName').toLowerCase();
            var dragger;
            if ( tagName !== 'img' ) {
                dragger = target;
            } else if ( tagName === 'img') {
                var pos = getPos(target, settings.initX, settings.initY),
                    size = getSize(target);
                var isParentDiv = target.parent().is('div');
                var isParentResizer = target.parent().hasClass( settings.resizer );
                if ( !( isParentDiv && isParentResizer) ) {
                    target.wrap('<div class="' + settings.dragger + '"></div>');
                }
                dragger = target.parent();
                dragger.css({
                    'padding': '0'
                });
                setLayout(dragger, pos, size);
            }
            dragger.addClass(settings.dragger);
            dragger.on('mousedown', function(e){
                startDrag(e, $(this));
            });
            function startDrag(e, dragger) {
                e.preventDefault();
                e.stopPropagation();
                var x = e.clientX;
                var y = e.clientY;
                var left = dragger.offset().left;
                var top = dragger.offset().top;
                dragger.on('mousemove', function(e){ 
                    dragging(e, dragger, x, y, left, top);
                });
                dragger.on('mouseup', function(e){
                    endDrag(e, dragger);
                });
            };
            function dragging(e, dragger, x, y, left, top) {
                e.preventDefault();
                e.stopPropagation();
                var _x = e.clientX;
                var _y = e.clientY;
                dragger.addClass(settings.draggerDragging);
                dragger.offset({
                    'left': _x -  x + left,
                    'top': _y -  y + top 
                });
            };
            function endDrag(e, dragger) {
                e.preventDefault();
                dragger.removeClass(settings.draggerDragging);
                dragger.off('mouseup');
                dragger.off('mousemove');
            };
            
		},
		resize: function(options) {
            var settings = $.extend(true, {}, resizerDefaults, draggerDefaults, options),
                target = $(this);
			var tagName = target.prop('tagName').toLowerCase();
			var resizer;
			if ( tagName !== 'img' ) {
                resizer = target;
                resizer.addClass(settings.resizer);
                addResizerControl(settings, resizer);
                setResizerControl(settings, resizer);
                resizer.on('mousedown', getClass(settings.resizerControl) , function(e){
                    startResize(e, resizer, settings, $(this));
                });
			} else if ( tagName === 'img') {
                var pos = getPos(target),
                    size = getSize(target, settings.initWidth, settings.initHeight);
                target.attr('init-size', JSON.stringify( size ) );
                var isParentDiv = target.parent().is('div');
                var isParentDragger = target.parent().hasClass( settings.dragger );
                if ( !( isParentDiv && isParentDragger) ) {
                    target.wrap('<div class="' + settings.resizer + '"></div>');
                }
                resizer = target.parent();
                resizer.addClass(settings.resizer);
                setResizerImage(resizer, target, settings, pos);
			}
            function setResizerImage(resizer, img, settings, pos){
                var initSize = JSON.parse( img.attr('init-size') );
                resizer.offset({
                    'left': pos.x,
                    'top': pos.y,
                });
                resizer.css({
                    'width': getPixel(initSize.width),
                    'height': getPixel(initSize.height),
                    'padding': '0'
                });
                img.offset({
                    'left': pos.x,
                    'top': pos.y,
                });
                img.css({
                    'width': getPixel(initSize.width),
                    'height': getPixel(initSize.height),
                });
                img.addClass(settings.resizerContent);
                addResizerControl(settings, resizer);
                setResizerControl(settings, resizer);
                resizer.on('mousedown', getClass(settings.resizerControl) , function(e){
                    startResize(e, resizer, settings, $(this));
                });
            };
            function addResizerControl(settings, resizer) {
                resizer.append('<div class="' + settings.resizerControl + ' ' + settings.resizerEast + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerSouth + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerWest + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerNorth + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerNE + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerSE + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerSW + '"></div>')
                .append('<div class="' + settings.resizerControl + ' ' + settings.resizerNW + '"></div>');
            };
            function setResizerControl(settings, resizer) {
                var w = 10, h = 10;
                resizer.find( getClass(settings.resizerControl) ).css({
                    'position': 'absolute',
                    'width': getPixel(w),
                    'height': getPixel(h),
                    'background-color': '#00d0d1',
                    'z-index': '90'
                });
                resizer.find( getClass(settings.resizerEast) ).css({
                    'right': '0px',
                    'top': '50%',
                    'margin-top': getPixel(-h/2)
                });
                resizer.find( getClass(settings.resizerSouth) ).css({
                    'left': '50%',
                    'bottom': '0px',
                    'margin-left': getPixel(-w/2)
                });
                resizer.find( getClass(settings.resizerWest) ).css({
                    'left': '0px',
                    'top': '50%',
                    'margin-top': getPixel(-h/2)
                });
                resizer.find( getClass(settings.resizerNorth) ).css({
                    'left': '50%',
                    'top': '0px',
                    'margin-left': getPixel(-w/2)
                });
                resizer.find( getClass(settings.resizerNE) ).css({
                    'right': '0px',
                    'top': '0px',
                });
                resizer.find( getClass(settings.resizerSE) ).css({
                    'right': '0px',
                    'bottom': '0px'
                });
                resizer.find( getClass(settings.resizerSW) ).css({
                    'left':'0px',
                    'bottom': '0px'
                });
                resizer.find( getClass(settings.resizerNW) ).css({
                    'left':'0px',
                    'top': '0px'
                });
            };
            function startResize(e, resizer, settings, ctrl) {
                e.preventDefault();
                e.stopPropagation();
                var x = e.clientX;
                var y = e.clientY;
                var left = resizer.offset().left;
                var top = resizer.offset().top;
                var content = '', width, height;
                if ( resizer.find( getClass(settings.resizerContent) ).length > 0 ) {
                    content = resizer.find( getClass(settings.resizerContent) );
                    width = parseFloat(content.css('width').replace('px', ''));
                    height = parseFloat(content.css('height').replace('px', ''));
                } else {
                    width = parseFloat(resizer.css('width').replace('px', ''));
                    height = parseFloat(resizer.css('height').replace('px', ''));
                }
                $(document).on('mousemove', function(e){
                    resizing(e, resizer, settings, ctrl, x, y, left, top, width, height, content);
                });
                $(document).on('mouseup', function(e){
                    endResize(e, resizer, ctrl);
                });
            };
            function resizing(e, resizer, settings, ctrl, x, y, left, top, width, height, content){
                e.preventDefault();
                e.stopPropagation();
                resizer.addClass( settings.resizerResizing );
                var geo = getGeometry(e, resizer, settings, ctrl, x, y, left, top, width, height);
                resizer.offset({
                    'left': geo.left,
                    'top': geo.top 
                });
                resizer.css('width', getPixel(geo.width) );
                resizer.css('height', getPixel(geo.height) );
                if ( content !== '' ) {
                    content.css('width', getPixel(geo.width) );
                    content.css('height', getPixel(geo.height) );
                }
            };
            function getGeometry(e, resizer, settings, ctrl, x, y, left, top, width, height) {
                var geo = {}, tmpW, tmpH, rightLimit, bottomLimit, deltaX, deltaY;
                if ( ctrl.hasClass(settings.resizerEast) ) {
                    tmpW = width + ( e.clientX - x );
                    geo.width = tmpW < settings.minWidth ? settings.minWidth : tmpW;
                    geo.height = height;
                    geo.left = left;
                    geo.top = top;
                } else if ( ctrl.hasClass(settings.resizerSouth) ) {
                    tmpH = height + ( e.clientY - y );
                    geo.width = width;
                    geo.height = tmpH < settings.minHeight ? settings.minHeight : tmpH;
                    geo.left = left;
                    geo.top = top;
                } else if ( ctrl.hasClass(settings.resizerWest) ) {
                    tmpW = width - ( e.clientX - x );
                    rightLimit = left + width - settings.minWidth;
                    deltaX = x - left;
                    geo.width = tmpW < settings.minWidth ? settings.minWidth : tmpW;
                    geo.height = height;
                    geo.left = (e.clientX - deltaX) > rightLimit ? rightLimit : (e.clientX - deltaX);
                    geo.top = top;
                } else if ( ctrl.hasClass(settings.resizerNorth) ) {
                    tmpH = height - ( e.clientY - y );
                    bottomLimit = top + height - settings.minHeight;
                    deltaY = y - top;
                    geo.width = width;
                    geo.height = tmpH < settings.minHeight ? settings.minHeight : tmpH;
                    geo.left = left;
                    geo.top = (e.clientY - deltaY) > bottomLimit ? bottomLimit : (e.clientY - deltaY);
                } else if ( ctrl.hasClass(settings.resizerNE) ) {
                    tmpW = width + ( e.clientX - x ); 
                    tmpH = height - ( e.clientY - y );
                    bottomLimit = top + height - settings.minHeight;
                    deltaY = y - top;
                    geo.width = tmpW < settings.minWidth ? settings.minWidth : tmpW;
                    geo.height = tmpH < settings.minHeight ? settings.minHeight : tmpH;
                    geo.left = left;
                    geo.top = (e.clientY - deltaY) > bottomLimit ? bottomLimit : (e.clientY - deltaY);
                } else if ( ctrl.hasClass(settings.resizerSE) ) {
                    tmpW = width + ( e.clientX - x ); 
                    tmpH = height + ( e.clientY - y );
                    geo.width = tmpW < settings.minWidth ? settings.minWidth : tmpW;
                    geo.height = tmpH < settings.minHeight ? settings.minHeight : tmpH;
                    geo.left = left;
                    geo.top = top;
                } else if ( ctrl.hasClass(settings.resizerSW) ) {
                    tmpW = width - ( e.clientX - x ); 
                    tmpH = height + ( e.clientY - y );
                    rightLimit = left + width - settings.minWidth;
                    deltaX = x - left;
                    geo.width = tmpW < settings.minWidth ? settings.minWidth : tmpW;
                    geo.height = tmpH < settings.minHeight ? settings.minHeight : tmpH;
                    geo.left = (e.clientX - deltaX) > rightLimit ? rightLimit : (e.clientX - deltaX);
                    geo.top = top;
                } else if ( ctrl.hasClass(settings.resizerNW) ) {
                    tmpW = width - ( e.clientX - x ); 
                    tmpH = height - ( e.clientY - y );
                    rightLimit = left + width - settings.minWidth;
                    deltaX = x - left;
                    bottomLimit = top + height - settings.minHeight;
                    deltaY = y - top;
                    geo.width = tmpW < settings.minWidth ? settings.minWidth : tmpW;
                    geo.height = tmpH < settings.minHeight ? settings.minHeight : tmpH;
                    geo.left = (e.clientX - deltaX) > rightLimit ? rightLimit : (e.clientX - deltaX);
                    geo.top = (e.clientY - deltaY) > bottomLimit ? bottomLimit : (e.clientY - deltaY);
                } else {
                    return;
                }
                return geo;
            };
            function endResize(e, resizer, ctrl){
                e.preventDefault();
                resizer.removeClass(settings.resizerResizing);
                $(document).off('mouseup');
                $(document).off('mousemove');
            };
		},
	});
})(jQuery);
window.ideia.service('ScrollRender', function () {
    this.render = function (content, forceIsTranslate) {
        return (function (global) {

            var isTranslate = ionic.Platform.isAndroid() && ionic.Platform.version() > 4.4;

            var docStyle = document.documentElement.style;

            var engine;
            if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
                engine = 'presto';
            } else if ('MozAppearance' in docStyle) {
                engine = 'gecko';
            } else if ('WebkitAppearance' in docStyle) {
                engine = 'webkit';
            } else if (typeof navigator.cpuClass === 'string') {
                engine = 'trident';
            }

            var vendorPrefix = {
                trident: 'ms',
                gecko: 'Moz',
                webkit: 'Webkit',
                presto: 'O'
            }[engine];

            var helperElem = document.createElement("div");
            var undef;

            var perspectiveProperty = vendorPrefix + "Perspective";
            var transformProperty = vendorPrefix + "Transform";

            if ((isTranslate || forceIsTranslate) && helperElem.style[perspectiveProperty] !== undef) { // helperElem.style[perspectiveProperty] !== undef

                return function (left, top, zoom) {
                    content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
                };

            } else if ((isTranslate || forceIsTranslate) && helperElem.style[transformProperty] !== undef) { // helperElem.style[transformProperty] !== undef

                return function (left, top, zoom) {
                    content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
                };

            } else {

                return function (left, top, zoom) {
                    // content.style[transformProperty] = 'translateZ(0)';
                    content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
                    content.style.marginTop = top ? (-top / zoom) + 'px' : '';
                    content.style.zoom = zoom || '';
                };

            }
        })(this);
    };

})
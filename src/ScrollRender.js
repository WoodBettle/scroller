function ScrollRender(content, forceIsTranslate) {
  return ((global) => {
    const docStyle = document.documentElement.style;

    let engine;
    if (global.opera && Object.prototype.toString.call(global.opera) === '[object Opera]') {
      engine = 'presto';
    } else if ('MozAppearance' in docStyle) {
      engine = 'gecko';
    } else if ('WebkitAppearance' in docStyle) {
      engine = 'webkit';
    } else if (typeof navigator.cpuClass === 'string') {
      engine = 'trident';
    }

    const vendorPrefix = {
      trident: 'ms',
      gecko: 'Moz',
      webkit: 'Webkit',
      presto: 'O',
    }[engine];

    const helperElem = document.createElement('div');
    const undef = undefined;

    const perspectiveProperty = `${vendorPrefix}Perspective`;
    const transformProperty = `${vendorPrefix}Transform`;

    if (forceIsTranslate && helperElem.style[perspectiveProperty] !== undef) {
      return (left, top, zoom) => {
        content.style[transformProperty] = `translate3d(${(-left)}px,${(-top)}px,0) scale(${zoom})`;
      };
    } else if (forceIsTranslate && helperElem.style[transformProperty] !== undef) {
      return (left, top, zoom) => {
        content.style[transformProperty] = `translate(${(-left)}px,${(-top)}px) scale(${zoom})`;
      };
    }
    return (left, top, zoom) => {
      // content.style[transformProperty] = 'translateZ(0)';
      content.style.marginLeft = left ? `${(-left / zoom)}px` : '';
      content.style.marginTop = top ? `${(-top / zoom)}px` : '';
      content.style.zoom = zoom || '';
    };
  })(this);
}

export default ScrollRender;

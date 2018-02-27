'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

(function (window, document, apiMetaFlexibleOptions) {
  var Plan = {
    TargetDensityDpi: 0,
    ScaleRatio: 1
  };

  var Impact = {
    Yes: 1,
    No: -1,
    Unknown: 0
  };

  var defaultMetaFlexibleOptions = {
    namespace: 'meta-flexible',
    designViewpoint: 750,
    getMetaViewpointTargetDensityDpiContent: function getMetaViewpointTargetDensityDpiContent(designViewpoint) {
      return 'width=' + designViewpoint + ', target-densitydpi=device-dpi, user-scalable=no, viewport-fit=cover';
    },
    getMetaViewpointScaleRatioContent: function getMetaViewpointScaleRatioContent(scale) {
      return 'width=device-width, initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no, viewport-fit=cover';
    },
    isMobile: function isMobile() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    },
    plans: [Plan.TargetDensityDpi, Plan.ScaleRatio],
    Plan: Plan,
    enableBodyFontSize: false
  };

  var metaFlexibleOptions = _extends({}, defaultMetaFlexibleOptions, apiMetaFlexibleOptions);

  var getMetaViewpointTargetDensityDpiContent = metaFlexibleOptions.getMetaViewpointTargetDensityDpiContent;

  var getMetaViewpointScaleRatioContent = metaFlexibleOptions.getMetaViewpointScaleRatioContent;

  var NAMESPACE = metaFlexibleOptions.namespace;

  var LOG_PREFIX = NAMESPACE;

  var designViewpoint = metaFlexibleOptions.designViewpoint;

  var docEl = document.documentElement;

  var dpr = window.devicePixelRatio || 1;

  var plans = [Plan.TargetDensityDpi, Plan.ScaleRatio];

  function invariant(condition, message) {
    if (!condition) {
      throw new Error(LOG_PREFIX + ': ' + message);
    }
  }

  function warn(condition, message) {
    if (!condition) {
      console.warn(LOG_PREFIX + ': ' + message);
    }
  }

  function invariantMetaViewPoint() {
    var metaViewPointElement = getMetaViewpointElement();
    invariant(!metaViewPointElement, '在使用当前工具库时请勿使用自定义viewpoint meta. viewpoint meta 将会通过当前工具自动计算生成.');
  }

  function getMetaViewpointElement() {
    return document.querySelector('meta[name="viewport"]');
  }

  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = 12 * dpr + 'px';
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }

  function createOrUpdateMetaViewpoint(metaViewpoint, content) {
    var isAppended = !!metaViewpoint;
    if (isAppended) {
      metaViewpoint.setAttribute('content', content);
    } else {
      if (!metaViewpoint) {
        var metaViewpointElement = getMetaViewpointElement();
        if (!metaViewpointElement) {
          metaViewpoint = document.createElement('meta');
          metaViewpoint.setAttribute('name', 'viewport');
        } else {
          metaViewpoint = metaViewpointElement;
        }
      }
      metaViewpoint.setAttribute('content', content);
      var headElement = docEl.querySelector('head');
      if (headElement) {
        headElement.appendChild(metaViewpoint);
      } else {
        var wrap = document.createElement('div');
        wrap.appendChild(metaViewpoint);
        document.write(wrap.innerHTML);
      }
    }
    return metaViewpoint;
  }

  var setMetaViewpointTargetDensityDpi = function () {
    var isAppended = false;
    return function () {
      if (!isAppended) {
        createOrUpdateMetaViewpoint(void 0, getMetaViewpointTargetDensityDpiContent(designViewpoint));
        isAppended = true;
      }
    };
  }();

  var setMetaViewpointScaleRatio = function () {
    var metaViewpoint = void 0;
    return function (scale) {
      metaViewpoint = createOrUpdateMetaViewpoint(metaViewpoint, getMetaViewpointScaleRatioContent(scale));
    };
  }();

  var applyResponsePlan = function () {
    var clientWidth = void 0;

    var hasImpact = Impact.No;
    return function () {
      if (clientWidth !== docEl.clientWidth) {
        clientWidth = docEl.clientWidth;

        if (hasImpact === Impact.Yes) {
          implementPlan(plans[0]);
          return;
        }
        while (hasImpact === Impact.No) {
          if (plans.length <= 0) {
            setTimeout(function () {
              return invariant(false, NAMESPACE + '\u6240\u4F7F\u7528\u7684\u6240\u6709\u65B9\u6848\u5931\u6548, \u6682\u7528\u6700\u540E\u4E00\u79CD\u65B9\u6848\u515C\u5E95');
            }, 0);
            break;
          }

          hasImpact = hasPlanImpact(function () {
            return implementPlan(plans[0]);
          });

          if (hasImpact === Impact.No) {
            plans.shift();
          }
        }

        hasImpact === Impact.Unknown && (hasImpact = Impact.No);
      }
    };
  }();

  function implementPlan(currentPlan) {
    switch (currentPlan) {
      case Plan.TargetDensityDpi:
        targetDensityDpiImpl();
        break;
      case Plan.ScaleRatio:
        scaleRatioImpl();
        break;
      default:
        invariant(false, '\u672A\u77E5 meta-flexible \u65B9\u6848, plan = ' + currentPlan);
    }
  }

  function targetDensityDpiImpl() {
    setMetaViewpointTargetDensityDpi();
  }

  function scaleRatioImpl() {
    var width = window.screen.width;
    var scale = width / designViewpoint;
    scale > 1 && (scale = 1);
    setMetaViewpointScaleRatio(scale);
  }

  function tryAddHairLine() {
    if (dpr >= 2) {
      var fakeBody = document.createElement('body');
      var testElement = document.createElement('div');
      testElement.style.border = '.5px solid transparent';
      fakeBody.appendChild(testElement);
      docEl.appendChild(fakeBody);
      if (testElement.offsetHeight === 1) {
        docEl.classList.add('hairlines');
      }
      docEl.removeChild(fakeBody);
    }
  }

  function hasPlanImpact(action) {
    var clientWidthBeforeMeta = docEl.clientWidth;
    action();
    var clientWidthAfterMeta = docEl.clientWidth;
    if (getScreenWidth() === designViewpoint) {
      return Impact.Unknown;
    }
    return clientWidthAfterMeta === clientWidthBeforeMeta ? Impact.No : Impact.Yes;
  }

  function getScreenWidth() {
    return window.screen.width;
  }

  (function () {
    var enableBodyFontSize = metaFlexibleOptions.enableBodyFontSize,
        isMobile = metaFlexibleOptions.isMobile;


    if (!isMobile()) {
      warn(false, '\u8BF7\u786E\u4FDD\u5728\u79FB\u52A8\u7AEF\u4E0B\u4F7F\u7528' + NAMESPACE);
      return;
    }

    invariantMetaViewPoint();

    if (enableBodyFontSize) {
      setBodyFontSize();
    }

    applyResponsePlan();

    window.addEventListener('resize', function () {
      var timeoutId = void 0;
      return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(applyResponsePlan, 300);
      };
    }());

    window.addEventListener('pageshow', function (e) {
      e.persisted && applyResponsePlan();
    }, false);

    tryAddHairLine();
  })();
})(window, document, window.__META_FLEXIBLE__ = window.__META_FLEXIBLE__ || {});
//# sourceMappingURL=meta-flexible.cjs.js.map

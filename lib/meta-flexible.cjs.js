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
  apiMetaFlexibleOptions.version = '0.0.14';

  var computeDiffFontSizeRatio = function () {
    var diffFontSizeRatio = void 0;

    var computeActualFontSize = function computeActualFontSize() {
      return +getComputedStyle(document.documentElement).getPropertyValue('font-size').replace(/px/, '');
    };
    return function () {
      if (!diffFontSizeRatio) {
        var rawDocElementCssText = document.documentElement.style.cssText;
        document.documentElement.style.cssText = 'font-size:100px !important';
        var docElementStyleFontSize = 100;
        var actualFontSize = computeActualFontSize();
        diffFontSizeRatio = actualFontSize / docElementStyleFontSize;
        document.documentElement.style.cssText = rawDocElementCssText;
      }
      return diffFontSizeRatio;
    };
  }();

  var Plan = {
    TargetDensityDpi: 0,
    ScaleRatio: 1,
    Rem: 2,
    Viewpoint: 3
  };

  var Impact = {
    Yes: 1,
    No: -1,
    Unknown: 0
  };

  var RemResizeDependency = {
    Width: 'width',
    Height: 'height',
    Auto: 'auto',
    UseBiggerSize: 'useBiggerSize',
    UseSmallerSize: 'useSmallerSize'
  };

  var noop = function noop(f) {
    return f;
  };

  var defaultMetaFlexibleOptions = {
    namespace: 'meta-flexible',

    designViewpoint: 750,
    getMetaViewpointTargetDensityDpiContent: function getMetaViewpointTargetDensityDpiContent(designViewpoint, enableViewpointFitForIphoneX) {
      return ['width=' + designViewpoint, 'target-densitydpi=device-dpi', 'user-scalable=no', enableViewpointFitForIphoneX && 'viewport-fit=cover'].filter(Boolean).join(', ');
    },
    getMetaViewpointScaleRatioContent: function getMetaViewpointScaleRatioContent(scale, enableViewpointFitForIphoneX) {
      return ['width=device-width', 'initial-scale=1', 'maximum-scale=' + scale, 'minimum-scale=' + scale, 'user-scalable=no', enableViewpointFitForIphoneX && 'viewport-fit=cover'].filter(Boolean).join(', ');
    },

    isMobile: function isMobile() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|HuaweiBrowser|ArkWeb/i.test(navigator.userAgent)
      );
    },

    plans: [Plan.TargetDensityDpi, Plan.ScaleRatio],

    Plan: Plan,

    enableBodyFontSize: false,

    enableViewpointFitForIphoneX: false,

    remRatio: 10,

    remUpperResizeLimit: 540,

    remResizeDependency: RemResizeDependency.Width,

    client: undefined,

    disableReportPlanNotWorkingErrorOnce: true,

    fixRemManualSettingFontResize: true,

    onBeforeApplyPlan: noop,

    applyResponsePlanOnce: false
  };

  var metaFlexibleOptions = _extends({}, defaultMetaFlexibleOptions, apiMetaFlexibleOptions);

  var getMetaViewpointTargetDensityDpiContent = metaFlexibleOptions.getMetaViewpointTargetDensityDpiContent;

  var getMetaViewpointScaleRatioContent = metaFlexibleOptions.getMetaViewpointScaleRatioContent;

  var NAMESPACE = metaFlexibleOptions.namespace;

  var LOG_PREFIX = NAMESPACE;

  var designViewpoint = metaFlexibleOptions.designViewpoint;

  var enableViewpointFitForIphoneX = metaFlexibleOptions.enableViewpointFitForIphoneX;

  var docEl = document.documentElement;

  var dpr = window.devicePixelRatio || 1;

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
      var metaViewpointElement = getMetaViewpointElement();
      if (!metaViewpointElement) {
        metaViewpoint = document.createElement('meta');
        metaViewpoint.setAttribute('name', 'viewport');
      } else {
        metaViewpoint = metaViewpointElement;
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
    var orientationChangeCounter = 0;
    return function () {
      if (!isAppended) {
        createOrUpdateMetaViewpoint(void 0, getMetaViewpointTargetDensityDpiContent(designViewpoint, enableViewpointFitForIphoneX));

        window.addEventListener('orientationchange', function () {
          setTimeout(function () {
            if (window.innerWidth !== designViewpoint) {
              orientationChangeCounter++;
              if (orientationChangeCounter > 5) {
                orientationChangeCounter = 0;
              }
              createOrUpdateMetaViewpoint(void 0, getMetaViewpointTargetDensityDpiContent(designViewpoint + orientationChangeCounter / 1000, enableViewpointFitForIphoneX));
            }
          }, 250);
        });
        isAppended = true;
      }
    };
  }();

  var setMetaViewpointScaleRatio = function () {
    var metaViewpoint = void 0;

    var prevScale = void 0;
    return function (scale) {
      if (prevScale !== scale) {
        prevScale = scale;
        metaViewpoint = createOrUpdateMetaViewpoint(metaViewpoint, getMetaViewpointScaleRatioContent(scale, enableViewpointFitForIphoneX));
      }
    };
  }();

  var reportPlanNotWorkingErrorOnce = function () {
    var hasReported = false;
    return function () {
      var errorMessage = NAMESPACE + '\u6240\u4F7F\u7528\u7684\u6240\u6709\u65B9\u6848\u5931\u6548, \u6682\u7528\u6700\u540E\u4E00\u79CD\u65B9\u6848\u515C\u5E95';
      if (!metaFlexibleOptions.disableReportPlanNotWorkingErrorOnce) {
        if (!hasReported) {
          setTimeout(function () {
            return invariant(false, errorMessage);
          }, 0);
        }
      } else {
        console.warn(errorMessage);
      }
    };
  }();

  var applyResponsePlan = function () {
    var hasImpact = Impact.No;

    var currentPlan = void 0;

    return function () {
      metaFlexibleOptions.onBeforeApplyPlan(metaFlexibleOptions);

      if (hasImpact === Impact.Yes) {
        implementPlan(currentPlan);
        return;
      }
      if (metaFlexibleOptions.plans.length === 0) {
        hasImpact = Impact.Yes;
        implementPlan(currentPlan);
        return;
      }
      while (hasImpact === Impact.No) {
        if (metaFlexibleOptions.plans[0] !== undefined) {
          currentPlan = metaFlexibleOptions.plans[0];
        }

        if (metaFlexibleOptions.plans.length <= 0) {
          reportPlanNotWorkingErrorOnce();
          break;
        }

        hasImpact = hasPlanImpact(function () {
          return implementPlan(currentPlan);
        });

        if (hasImpact === Impact.No) {
          metaFlexibleOptions.plans.shift();
        }
      }

      hasImpact === Impact.Unknown && (hasImpact = Impact.No);
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
      case Plan.Rem:
        remImpl();
        break;
      case Plan.Viewpoint:
        viewpointImpl();
        break;
      default:
        invariant(false, '\u672A\u77E5 meta-flexible \u65B9\u6848, plan = ' + currentPlan);
    }
  }

  function remImpl() {
    setMetaViewpointScaleRatio(1);
    refreshRem();
  }

  function viewpointImpl() {
    setMetaViewpointScaleRatio(1);
    refreshRem(false);
  }

  function refreshRem() {
    var hasResizeLimit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    var base = void 0;
    var remResizeDependency = metaFlexibleOptions.remResizeDependency,
        remUpperResizeLimit = metaFlexibleOptions.remUpperResizeLimit,
        remRatio = metaFlexibleOptions.remRatio,
        fixRemManualSettingFontResize = metaFlexibleOptions.fixRemManualSettingFontResize;

    if (remResizeDependency === RemResizeDependency.Width) {
      base = docEl.clientWidth;
    } else if (remResizeDependency === RemResizeDependency.Height) {
      base = docEl.clientHeight;
    } else if (remResizeDependency === RemResizeDependency.Auto || remResizeDependency === RemResizeDependency.UseSmallerSize) {
      base = Math.min(docEl.clientWidth, docEl.clientHeight);
    } else if (remResizeDependency === RemResizeDependency.UseBiggerSize) {
      base = Math.max(docEl.clientWidth, docEl.clientHeight);
    }
    if (hasResizeLimit) {
      if (base > remUpperResizeLimit) {
        base = remUpperResizeLimit;
      }
    }
    var rem = base / remRatio;
    if (fixRemManualSettingFontResize) {
      rem = rem / computeDiffFontSizeRatio();
    }
    docEl.style.fontSize = rem + 'px';
    apiMetaFlexibleOptions.rem = rem;
  }

  function targetDensityDpiImpl() {
    setMetaViewpointTargetDensityDpi();
  }

  function scaleRatioImpl() {
    var width = getScreenWidth();
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

    if (!metaFlexibleOptions.applyResponsePlanOnce) {
      window.addEventListener('resize', function () {
        var timeoutId = void 0;
        return function () {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(applyResponsePlan, 300);
        };
      }());
    }

    window.addEventListener('pageshow', function (e) {
      e.persisted && applyResponsePlan();
    }, false);

    tryAddHairLine();

    apiMetaFlexibleOptions.applyResponsePlan = applyResponsePlan;
  })();
})(window, document, window.__META_FLEXIBLE__ = window.__META_FLEXIBLE__ || {});
//# sourceMappingURL=meta-flexible.cjs.js.map

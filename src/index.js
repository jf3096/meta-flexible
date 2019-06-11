(function (window, document, apiMetaFlexibleOptions) {
  /**
   * 标记版本, 自动生成版本号
   * @type {string}
   */
  apiMetaFlexibleOptions.version = '<@VERSION@>';

  /**
   * 计算文字大小比例差, 用于检查用户在手机浏览器中发大了字体导致响应式失效
   */
  const computeDiffFontSizeRatio = (() => {
    let diffFontSizeRatio;
    /**
     * 当前实际字体大小, 用于检查用户在手机浏览器中发大了字体导致响应式失效
     * @returns {number}
     */
    const computeActualFontSize = () => {
      return +getComputedStyle(document.documentElement).getPropertyValue('font-size').replace(/px/, '');
    };
    return () => {
      if (!diffFontSizeRatio) {
        const rawDocElementCssText = document.documentElement.style.cssText;
        document.documentElement.style.cssText = 'font-size:100px !important';
        const docElementStyleFontSize = 100;
        const actualFontSize = computeActualFontSize();
        diffFontSizeRatio = actualFontSize / docElementStyleFontSize;
        document.documentElement.style.cssText = rawDocElementCssText;
      }
      return diffFontSizeRatio;
    };
  })();

  /**
   * 方案枚举
   */
  const Plan = {
    TargetDensityDpi: 0,
    ScaleRatio: 1,
    Rem: 2,
    Viewpoint: 3
  };

  /**
   * 是否有生效, 用于判断当前方案是否真正生效
   */
  const Impact = {
    Yes: 1,
    No: -1,
    Unknown: 0
  };

  /**
   * 默认options, 当前client属性为保留字段, 可接受 'pc' | 'mobile'
   * @type {{enableBodyFontSize: boolean, enableViewpointFitForIphoneX: boolean, disableReportPlanNotWorkingErrorOnce: boolean, Plan: {ScaleRatio: number, Viewpoint: number, Rem: number, TargetDensityDpi: number}, designViewpoint: number, remUpperResizeLimit: number, plans: number[], namespace: string, fixRemManualSettingFontResize: boolean, client: undefined, getMetaViewpointScaleRatioContent(*, *=): string, isMobile: (function(): boolean), remRatio: number, getMetaViewpointTargetDensityDpiContent(*, *=): string}}
   */
  const defaultMetaFlexibleOptions = {
    /**
     * 日志命名空间
     */
    namespace: 'meta-flexible',
    /**
     * 根据设计稿大小设置即可
     */
    designViewpoint: 750,
    /**
     * meta viewpoint content, 细节请参考返回值
     * @param designViewpoint
     * @param enableViewpointFitForIphoneX
     * @return {string}
     */
    getMetaViewpointTargetDensityDpiContent(designViewpoint, enableViewpointFitForIphoneX) {
      return [
        `width=${designViewpoint}`,
        'target-densitydpi=device-dpi',
        'user-scalable=no',
        enableViewpointFitForIphoneX && 'viewport-fit=cover',
      ].filter(Boolean).join(', ');
    },
    /**
     * meta viewpoint content, 细节请参考返回值
     * @param scale
     * @param enableViewpointFitForIphoneX
     * @return {string}
     */
    getMetaViewpointScaleRatioContent(scale, enableViewpointFitForIphoneX) {
      return [
        'width=device-width',
        'initial-scale=1',
        `maximum-scale=${scale}`,
        `minimum-scale=${scale}`,
        'user-scalable=no',
        enableViewpointFitForIphoneX && 'viewport-fit=cover'
      ].filter(Boolean).join(', ');
    },
    /**
     * 判断是否是移动端
     * @return {boolean}
     */
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    /**
     * 降级方案顺序
     */
    plans: [Plan.TargetDensityDpi, Plan.ScaleRatio],
    /**
     * 方案枚举
     */
    Plan,
    /**
     * 是否设置body字体
     */
    enableBodyFontSize: false,
    /**
     * 是否开启viewpoint fit
     */
    enableViewpointFitForIphoneX: false,
    /**
     * rem 比例
     */
    remRatio: 10,
    /**
     * rem最大上限, 通过设置该字段防止页面无限放大
     */
    remUpperResizeLimit: 540,
    /**
     * 标记当前客户端, 参考值 pc | mobile
     */
    client: undefined,
    /**
     * 禁止 ReportPlanNotWorkingErrorOnce
     */
    disableReportPlanNotWorkingErrorOnce: true,
    /**
     * 是否修复手动在(浏览器)中设置字体大小, 这会导致在 rem 方案中让响应式失效
     */
    fixRemManualSettingFontResize: true
  };

  /**
   * 合并外部API Options
   * @type {{enableBodyFontSize: boolean, enableViewpointFitForIphoneX: boolean, disableReportPlanNotWorkingErrorOnce: boolean, Plan: {ScaleRatio: number, Viewpoint: number, Rem: number, TargetDensityDpi: number}, designViewpoint: number, remUpperResizeLimit: number, plans: number[], namespace: string, fixRemManualSettingFontResize: boolean, client: undefined, getMetaViewpointScaleRatioContent, (*, *=): string, isMobile: (function(): boolean), remRatio: number, getMetaViewpointTargetDensityDpiContent, (*, *=): string}|*|{}}
   */
  const metaFlexibleOptions = {...defaultMetaFlexibleOptions, ...apiMetaFlexibleOptions};

  /**
   * 拉取 meta TargetDensityDpiContent 模板
   */
  const getMetaViewpointTargetDensityDpiContent = metaFlexibleOptions.getMetaViewpointTargetDensityDpiContent;

  /**
   * 拉取 meta ScaleRatio 模板
   * @param scale
   * @returns {string}
   */
  const getMetaViewpointScaleRatioContent = metaFlexibleOptions.getMetaViewpointScaleRatioContent;

  /**
   * 命名空间
   * @type {string}
   */
  const NAMESPACE = metaFlexibleOptions.namespace;

  /**
   * 错误前缀
   * @type {string}
   */
  const LOG_PREFIX = NAMESPACE;

  /**
   * 设计稿大小
   * @type {number}
   */
  const designViewpoint = metaFlexibleOptions.designViewpoint;

  /**
   * 是否启用viewpoint fit, 该属性仅对iphone-x生效
   * @type {boolean}
   */
  const enableViewpointFitForIphoneX = metaFlexibleOptions.enableViewpointFitForIphoneX;

  /**
   * 拉取 document 元素
   * @type {Element}
   */
  const docEl = document.documentElement;

  // noinspection JSUnresolvedVariable
  /**
   * 判断当前 window dpr 比例，若无直接降级使用 1
   * @type {*|number}
   */
  const dpr = window.devicePixelRatio || 1;

  /**
   * plan 列表
   */
  const plans = metaFlexibleOptions.plans;

  /**
   * rem的基准值, 如 remRatio = 10, 即在750px设计稿中, 1rem = 75px
   */
  const remRatio = metaFlexibleOptions.remRatio;

  /**
   * rem 页面宽度变化最大上限, 当大于 remUpperResizeLimit, 根节点 font-size 将不再变化
   */
  const remUpperResizeLimit = metaFlexibleOptions.remUpperResizeLimit;

  /**
   * 禁止 ReportPlanNotWorkingErrorOnce
   */
  const disableReportPlanNotWorkingErrorOnce = metaFlexibleOptions.disableReportPlanNotWorkingErrorOnce;

  /**
   * 是否修复手动在(浏览器)中设置字体大小, 这会导致在 rem 方案中让响应式失效
   * @type {boolean}
   */
  const fixRemManualSettingFontResize = metaFlexibleOptions.fixRemManualSettingFontResize;

  /**
   * 条件判错函数
   * @param condition 错误条件
   * @param message
   */
  function invariant(condition, message) {
    if (!condition) {
      throw new Error(`${LOG_PREFIX}: ${message}`);
    }
  }

  /**
   * 条件警告函数
   * @param condition 警告条件
   * @param message 警告信息
   */
  function warn(condition, message) {
    if (!condition) {
      // eslint-disable-next-line no-console
      console.warn(`${LOG_PREFIX}: ${message}`);
    }
  }

  /**
   * 判定页面中是否已经被手动设置 meta
   */
  function invariantMetaViewPoint() {
    const metaViewPointElement = getMetaViewpointElement();
    invariant(!metaViewPointElement, '在使用当前工具库时请勿使用自定义viewpoint meta. viewpoint meta 将会通过当前工具自动计算生成.');
  }

  /**
   * 获取 meta viewpoint
   */
  function getMetaViewpointElement() {
    return document.querySelector('meta[name="viewport"]');
  }

  /**
   * 设置 body 字体大小, 来自原本的 lib-flexible 源码, 作用暂未知
   */
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px';
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }

  /**
   * 创建或更新 meta view point
   * @param metaViewpoint {Element} - 如果传入的 metaViewpoint已经存在, 则直接更新即可
   * @param content {String} - viewpoint 内容
   * @returns {*}
   */
  function createOrUpdateMetaViewpoint(metaViewpoint, content) {
    const isAppended = !!metaViewpoint;
    if (isAppended) {
      metaViewpoint.setAttribute('content', content);
    } else {
      const metaViewpointElement = getMetaViewpointElement();
      if (!metaViewpointElement) {
        metaViewpoint = document.createElement('meta');
        metaViewpoint.setAttribute('name', 'viewport');
      } else {
        metaViewpoint = metaViewpointElement;
      }
      metaViewpoint.setAttribute('content', content);
      const headElement = docEl.querySelector('head');
      if (headElement) {
        headElement.appendChild(metaViewpoint);
      } else {
        const wrap = document.createElement('div');
        wrap.appendChild(metaViewpoint);
        document.write(wrap.innerHTML);
      }
    }
    return metaViewpoint;
  }

  /**
   * 设置 targetDensityDpi meta
   */
  const setMetaViewpointTargetDensityDpi = (() => {
    let isAppended = false;
    let orientationChangeCounter = 0;
    /**
     * 处理在 ios iphone 6 (可能也涉及其他机型), 在翻转手机后当值 targetdensity 方案失效, window.innerWidth 异常, 不等于 designViewpoint
     */
    window.addEventListener('orientationchange', () => {
      /**
       * 且这个行为发生在翻转过程的某一个时间点, 所以需要等待若干时间, 目前测试等待setTimeout时间, 100 (无效), 150 (偶然), 200(可用), 250(较稳)
       * 但不确定是否可能在性能低的时候翻转时间延长导致失效
       */
      setTimeout(() => {
        if (window.innerWidth !== designViewpoint) {
          orientationChangeCounter++;
          if (orientationChangeCounter > 5) {
            orientationChangeCounter = 0;
          }
          createOrUpdateMetaViewpoint(void 0, getMetaViewpointTargetDensityDpiContent(designViewpoint + orientationChangeCounter / 1000, enableViewpointFitForIphoneX));
        }
      }, 250);
    });
    return () => {
      if (!isAppended) {
        createOrUpdateMetaViewpoint(void 0, getMetaViewpointTargetDensityDpiContent(designViewpoint, enableViewpointFitForIphoneX));
        isAppended = true;
      }
    };
  })();

  /**
   * 设置 targetDensityDpi meta
   */
  const setMetaViewpointScaleRatio = (() => {
    let metaViewpoint;
    /**
     * 缓存先前scale值
     */
    let prevScale;
    return (scale) => {
      if (prevScale !== scale) {
        prevScale = scale;
        metaViewpoint = createOrUpdateMetaViewpoint(metaViewpoint, getMetaViewpointScaleRatioContent(scale, enableViewpointFitForIphoneX));
      }
    };
  })();

  /**
   * 上报错误, 异步抛异常, 用于上报
   */
  const reportPlanNotWorkingErrorOnce = (() => {
    const hasReported = false;
    return () => {
      const errorMessage = `${NAMESPACE}所使用的所有方案失效, 暂用最后一种方案兜底`;
      if (!disableReportPlanNotWorkingErrorOnce) {
        if (!hasReported) {
          setTimeout(() => invariant(false, errorMessage), 0);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(errorMessage);
      }
    };
  })();

  /**
   * 应用响应式方案
   */
  const applyResponsePlan = (() => {
    /**
     * 客户端长度, 当判定长度一致时不进入该函数, 从而减少计算
     */
    let clientWidth;
    /**
     * 是否生效,默认情况下是No
     */
    let hasImpact = Impact.No;
    /**
     * 用于存储当前方案
     */
    let currentPlan;
    return () => {
      if (clientWidth !== docEl.clientWidth) {
        clientWidth = docEl.clientWidth;
        /**
         * 如果已经发现当前方案已生效, 直接使用当前方案即可, 不再继续尝试后续方案
         */
        if (hasImpact === Impact.Yes) {
          /**
           * 第一个方案作为当前使用方案
           */
          implementPlan(currentPlan);
          return;
        }
        if (plans.length === 0) {
          implementPlan(currentPlan);
          return;
        }
        while (hasImpact === Impact.No) {
          if (plans[0] !== undefined) {
            /**
             * 指向当前方案
             */
            currentPlan = plans[0];
          }
          /**
           * 如果所有方案失效, 直接抛异常, 用于上报, 但保留最后一种方案
           */
          if (plans.length <= 0) {
            reportPlanNotWorkingErrorOnce();
            break;
          }
          /**
           * 是否有生效
           */
          hasImpact = hasPlanImpact(() => implementPlan(currentPlan));
          /**
           * 如果发现方案失效, 直接抛弃方案列表第一项
           */
          if (hasImpact === Impact.No) {
            plans.shift();
          }
        }
        /**
         * 当是否生效是未知时, 如: 当前页面大小完全等于预设的值 (设计稿大小), 那么无法判断是否生效
         * 当出现以上情况时, 重置 hasImpact = 无效, 让下一轮再次触发当前函数时在判定
         */
        hasImpact === Impact.Unknown && (hasImpact = Impact.No);
      }
    };
  })();

  /**
   * 方案具体实现函数, 根据枚举选择方案
   */
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
        invariant(false, `未知 meta-flexible 方案, plan = ${currentPlan}`);
    }
  }

  /**
   * rem 方案具体实现
   */
  function remImpl() {
    setMetaViewpointScaleRatio(1);
    refreshRem();
  }

  /**
   * viewpoint 方案具体实现
   */
  function viewpointImpl() {
    setMetaViewpointScaleRatio(1);
    refreshRem(false);
  }

  /**
   * 刷新Rem
   * @param hasResizeLimit
   */
  function refreshRem(hasResizeLimit = true) {
    let width = docEl.clientWidth;
    if (hasResizeLimit) {
      if (width > remUpperResizeLimit) {
        width = remUpperResizeLimit;
      }
    }
    let rem = width / remRatio;
    if (fixRemManualSettingFontResize) {
      rem = rem / computeDiffFontSizeRatio();
    }
    docEl.style.fontSize = `${rem}px`;
    apiMetaFlexibleOptions.rem = rem;
  }

  /**
   * target density dpi 具体实现
   */
  function targetDensityDpiImpl() {
    setMetaViewpointTargetDensityDpi();
  }

  /**
   * target density dpi 具体实现
   */
  function scaleRatioImpl() {
    const width = window.screen.width;
    let scale = width / designViewpoint;
    scale > 1 && (scale = 1);
    setMetaViewpointScaleRatio(scale);
  }

  /**
   * 检查发现支持0.5px
   */
  function tryAddHairLine() {
    if (dpr >= 2) {
      const fakeBody = document.createElement('body');
      const testElement = document.createElement('div');
      testElement.style.border = '.5px solid transparent';
      fakeBody.appendChild(testElement);
      docEl.appendChild(fakeBody);
      if (testElement.offsetHeight === 1) {
        docEl.classList.add('hairlines');
      }
      docEl.removeChild(fakeBody);
    }
  }

  /**
   * 方案是否有生效
   * @param action
   */
  function hasPlanImpact(action) {
    const clientWidthBeforeMeta = docEl.clientWidth;
    action();
    const clientWidthAfterMeta = docEl.clientWidth;
    if (getScreenWidth() === designViewpoint) {
      return Impact.Unknown;
    }
    return clientWidthAfterMeta === clientWidthBeforeMeta ? Impact.No : Impact.Yes;
  }

  /**
   * 获取当前屏幕宽度
   * @returns {Number}
   */
  function getScreenWidth() {
    return window.screen.width;
  }

  (function () {

    const {enableBodyFontSize, isMobile} = metaFlexibleOptions;

    if (!isMobile()) {
      warn(false, `请确保在移动端下使用${NAMESPACE}`);
      return;
    }

    /**
     * 校验判断 meta viewpoint, 禁止开发者手动添加
     */
    invariantMetaViewPoint();

    if (enableBodyFontSize) {
      /**
       * 立即自执行, 设置 body font size
       */
      setBodyFontSize();
    }
    /**
     * 直接触发页面
     */
    applyResponsePlan();

    /**
     * 在页面大小变更时触发更新
     */
    window.addEventListener('resize', (function () {
      let timeoutId;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(applyResponsePlan, 300);
      };
    }()));

    /**
     * onpageshow 事件类似于 onload 事件，onload 事件在页面第一次加载时触发，
     * onpageshow 事件在每次加载页面时触发，即 onload 事件在页面从浏览器缓存中读取时不触发
     */
    window.addEventListener('pageshow', (e) => {
      /** @namespace e.persisted */
      e.persisted && applyResponsePlan();
    }, false);

    /**
     * 尝试加入 Hairline 标记, 用于处理 border 1px的问题
     */
    tryAddHairLine();
  }());
}(window, document, window.__META_FLEXIBLE__ = window.__META_FLEXIBLE__ || {}));

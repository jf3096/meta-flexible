# meta-flexible

> 一个用于降级 meta target density dpi 的工具

通过 `meta target density dpi` 能够直接使用 px 进行页面开发, 并最终自动适配移动端. 但考虑到该方案在2012年被谷歌宣布弃用, 但依旧能够完美兼容
`手机和平板, Android (2.3+), IOS 8+, 苹果手机4-7plus, 微信, UC, Android 原生浏览器, IOS Safari` (上述明确版本项已测试). 但为了防止有
一天该方案被正式移除, 该工具通过其他手段自动降级支持.

所以, 在开发过程中, 我们可以直接根据设计稿, 如: `750px`, 直接切图, 无需过多考虑或使用 `postcss` 转换 `rem` 兼容等问题. 但由于目前市面上很多 ui 库都采用
基于375px为基准的px方案, 为了能够直接使用这些 ui 库, 我们需要使用 `postcss` 将我们如 `750px` 基准的开发样式自动转换成 `375px`, 最后改动当前工具配置项 `designViewpoint: 375` 即可完美支持响应式.

## 使用

```bash
  npm i meta-flexble -D
```

```javascript
  import 'meta-flexble';
```

```html
  <script src="//zhcdn01.xoyo.com/xassets/lib/meta-flexible/stable/meta-flexible.min.js"></script>
```

或直接引用
```html
  <script>
    // 以下配置可选
    window.__META_FLEXIBLE__ = {
        namespace: 'meta-flexible',
        designViewpoint: 750
      };
  </script>
  <script src="path/to/meta-flexible.umd.js"></script>
```

## 方案

目前工具支持 4 中模式, 分别是 TargetDensityDpi, ScaleRatio, Rem, Viewpoint。其中 ScaleRatio 为 TargetDensityDpi 降级方案，其原理根据页面除以设计稿大小等比缩放。
Rem 为目前移动端开发主流方案，Viewpoint代指vw、vh方案。 其枚举如下: 

```javascript
  const Plan = {
    TargetDensityDpi: 0,
    ScaleRatio: 1,
    Rem: 2,
    Viewpoint: 3
  };
```

如需启用指定方案, 可:

```javascript
  const Plan = {
    TargetDensityDpi: 0,
    ScaleRatio: 1,
    Rem: 2,
    Viewpoint: 3
  };
  window.__META_FLEXIBLE__ = {
    plans: [Plan.Rem]
  }
```


## REM 支持
在对外API中，默认 remRatio = 10， 即在750设计稿中，1rem = 750/10px = 75px，该值可自行根据需求修改即可。

## 注意

**1. 请不要手动添加 \<meta name="viewpoint"\>**

**2. 当前 meta 需要在移动端或 chrome F12 mobile模式下生效**

## API

当前工具使用以下默认值配置, 开发者可在引用当前工具前通过 `window.__META_FLEXIBLE__` 修改部分参数. 常见的修改如设计稿`640px`若并非`750px`, 则需要
手动改动 `designViewpoint: 640`即可.

```javascript
  window.__META_FLEXIBLE__ = {
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
     * rem比例
     */
    remRatio: 10,
    /**
     * rem最大上限, 通过设置该字段防止页面无限放大
     */
    remUpperResizeLimit: 540,
    /*
     * rem 缩放基准依赖, 有效值为 width|height|auto
     * 当缩放基准依赖为 width 时, 页面会根据宽度缩放而变化 html root 的 fontSize 大小
     * 当缩放基准依赖为 height 时, 页面会根据高度缩放而变化 html root 的 fontSize 大小
     * 当缩放基准依赖为 auto 时, 页面会根据宽高比决定, 并选择较小的值作为基准值
     * 默认: width
     */
    remResizeDependency: RemResizeDependency.Width,
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
```

## ChangeLog

## 0.0.9-alpha (2019-07-08)

* feat: 增加 `remResizeDependency` 用于新增对横屏的支持, 当使用横屏时应该使用基于 height 高度作为响应式基准而并非 width,  默认该值为 width

## 0.0.8 (2019-06-12)

* feat: 增加 `fixRemManualSettingFontResize` 用于修正部分用户手动放大浏览器字体导致 rem 响应式方案失效的问题, 默认该值为 true

## 0.0.7 (2019-02-03)

* feat: 延长 orientation change 延迟的监测, 从原来的 200ms 增加到 250ms
* change: 新增字段 `disableReportPlanNotWorkingErrorOnce`, 默认 `true`. 在兜底监测时, 决定不再上报错误, 改为 console.warn 

## 0.0.6 (2018-09-18)

* bug: 通过 orientationchange 修复 targetdensitydpi 方案下横竖屏在 ios 时切换导致响应式失效

## 0.0.5 (2018-05-08)

* feat: 加入rollup-replace用于自动生成版本号, 方便前端查阅使用的版本
* feat: 重命名, 移除 umd 后缀

## 0.0.4 (2018-04-10)

* feat: 加入 Rem 支持
* feat: 对于 viewport-fit=cover, 默认禁用, 加入外部 API 允许外部控制是否支持

## 0.0.3 (2018-01-09)

* feat: 设置 viewport-fit=cover 以兼容 iPhone X 全面屏“刘海”的显示

## 0.0.2 (2017-11-27)

* feat: 默认不启用 set body font size 方案
* feat: 加入仅对移动端生效的检测

## 作者
Ailun She


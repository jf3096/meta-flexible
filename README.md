# meta-flexible

> 一个用于降级 meta target density dpi 的工具

通过 meta target density dpi 能够直接使用 px 进行页面开发, 并最终自动适配移动端. 但考虑到该方案在2012年被谷歌宣布弃用, 但依旧能够完美兼容
手机和平板, Android (2.3+), IOS 8+, 苹果手机4-7plus, 微信, UC, Android 原生浏览器, IOS Safari (上述明确版本项已测试). 但为了防止有
一天该方案被正式移除, 该工具通过其他手段自动降级支持.

所以, 在开发过程中, 我们可以直接根据设计稿, 如: `750px`, 直接切图, 无需过多考虑或使用 `postcss` 转换 `rem` 兼容等问题. 但由于目前市面上很多 ui 库都采用
基于375px为基准的px方案, 为了能够直接使用这些 ui 库, 我们需要使用 `postcss` 将我们如 `750px` 基准的开发样式自动转换成 `375px`, 最后改动当前
工具配置项 `designViewpoint: 375` 即可完美支持响应式.

## 使用

```bash
  npm i meta-flexble -D
```

```javascript
  import 'meta-flexble';
```

或直接引用
```html
  <script>
    // 以下配置可选
    window.__META_FLEXIBLE__ = {
        namespace: 'meta-flexible',
        designViewpoint: 750,
        getMetaViewpointTargetDensityDpiContent: (designViewpoint) => `width=${designViewpoint}, target-densitydpi=device-dpi, user-scalable=no`,
        getMetaViewpointScaleRatioContent: (scale) => `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`
      };
  </script>
  <script src="path/to/meta-flexible.umd.js"></script>
```

## 注意

**1. 请不要手动添加 <meta name="viewpoint">**

**2. 当前 meta 需要在移动端或 chrome F12 mobile模式下生效**

## API

当前工具使用以下默认值配置, 开发者可在引用当前工具前通过 `window.__META_FLEXIBLE__` 修改部分参数. 常见的修改如设计稿`640px`若并非`750px`, 则需要
手动改动 `designViewpoint: 640`即可.

```javascript
  window.__META_FLEXIBLE__ = {
    // 命名空间
    namespace: 'meta-flexible', 
    // 设计稿大小
    designViewpoint: 750, 
    // meta viewpoint content, 细节请参考返回值
    getMetaViewpointTargetDensityDpiContent: (designViewpoint) => `width=${designViewpoint}, target-densitydpi=device-dpi, user-scalable=no`,
     // meta viewpoint content, 细节请参考返回值
    getMetaViewpointScaleRatioContent: (scale) => `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`
  };
```

## 作者
Ailun She


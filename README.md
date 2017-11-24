# meta-flexible

> 一个用于降级 meta target density dpi 的工具

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

当前工具使用以下默认值配置, 开发者可在引用当前工具前通过 `window.__META_FLEXIBLE__` 修改部分参数.

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


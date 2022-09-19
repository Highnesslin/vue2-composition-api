# vue2-composition-api

## 特性

1. 兼容性同 **Vue2** 保持一致，语法和 **Vue3** 保持一致
2. 体积更小

## 安装

```javascript
npm i vue2-composition-api
```
## 使用

### defineComponent

这是唯一一个与 [Vue3](https://www.npmjs.com/package/@vue/composition-api) 不同的API，

在 **vue2-composition-api** 中 `defineComponent` 是功能入口，因为我们在内部完成了 `setup` 到 `this` 的绑定。

```javascript
import { defineComponent } from 'vue2-composition-api'
export default defineComponent({
    name: 'App',
    setup(props) {
        // ...
    }
})

```

### 其他API

与 [Vue3 composition-api](https://www.npmjs.com/package/@vue/composition-api) 使用方式一致
import Vue from 'vue'
import { DefineComponentOptions, Ref, ToRefs } from './declare'

/**
 * 生命周期相关
 */
let currentInstance = null

const createLifeCycle = function (name: string) {
  const Lifecycles = [
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ]

  if (!Lifecycles.includes(name)) {
    throw new Error(name + '不存在')
  }

  return function (cb: () => void) {
    if (!currentInstance) throw new Error(name + '只能在 setup 中使用哦')

    if (currentInstance.$options[name]) {
      currentInstance.$options[name].push(cb)
    } else {
      currentInstance.$options[name] = cb
    }
  }
}

export const onBeforeMount = createLifeCycle('beforeMount')
export const onMounted = createLifeCycle('mounted')
export const onBeforeUpdate = createLifeCycle('beforeUpdate')
export const onUpdated = createLifeCycle('updated')
export const onBeforeUnmount = createLifeCycle('beforeDestroy')
export const onUnmounted = createLifeCycle('destroyed')
export const onActivated = createLifeCycle('activated')
export const onDeactivated = createLifeCycle('deactivated')

/**
 * 响应式相关
 */
const isComputed = Symbol('isComputed')
const isRef = Symbol('isRef')

export const reactive = Vue.observable

export const ref = function <T>(value: T): Ref<T> {
  return Vue.observable({ value })
}
export const toRef = function <T extends object, K extends keyof T>(obj: T, key: K): Ref<T[K]> {
  const ObjectRefImpl = {
    get value () {
      return obj[key]
    },
    set value (val) {
      obj[key] = val
    }
  }
  ObjectRefImpl[isRef] = true
  return ObjectRefImpl
}

export const toRefs = function <T extends object>(obj: T): ToRefs<T> {
  const ret = {} as ToRefs<T>;
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}

export const computed = function <T>(getter: () => T): () => T {
  getter[isComputed] = true
  return getter
}

/**
 * 入口文件相关
 */
const proxyToThis = function (obj: object) {
  for (const key in obj) {
    if (key in currentInstance) {
      continue
    }

    const value = obj[key]
    if (typeof value === 'function') {
      // getter
      if (value[isComputed]) {
        if (!currentInstance.$options.computed) currentInstance.$options.computed = {}
        currentInstance.$options.computed[key] = value
      } else {
        // methods
        if (!currentInstance.$options.methods) currentInstance.$options.methods = {}
        currentInstance.$options.methods[key] = value
      }
    } else if (value[isRef]) {
      // ref
      Object.defineProperty(currentInstance, key, {
        get () {
          return value.value
        },
        set (val) {
          value.value = val
        }
      })
    } else {
      // normal
      Object.defineProperty(currentInstance, key, {
        get () {
          return obj[key]
        },
        set (val) {
          obj[key] = val
        }
      })
    }
  }
}

export const defineComponent = function (options: DefineComponentOptions) {
  const { beforeCreate, setup, ...restOptions } = options

  return {
    beforeCreate: setup
      ? function () {
        beforeCreate && beforeCreate.call(this)

        currentInstance = this

        const options = setup(currentInstance.$props)

        proxyToThis(options)

        currentInstance = null
      } : undefined,
    ...restOptions
  }
}

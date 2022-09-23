import Vue from 'vue'
import { DefaultData, DefaultMethods, DefaultComputed, PropsDefinition, DefaultProps } from 'vue/types/options'
import { DefineComponentOptions, Ref, ToRefs } from './declare'

type VueInstance = InstanceType<typeof Vue>

/**
 * 生命周期相关
 */
let currentInstance: Vue | null = null

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
      currentInstance.$options[name] = [cb]
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
const isReactive = Symbol('isReactive')

export const reactive = function <T>(target: T): T {
  const state = Vue.observable(target)
  state[isReactive] = true
  return state
}

export const ref = function <T>(value: T): Ref<T> {
  const state = Vue.observable({ value })
  return toRef(state, 'value')
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

type watchParams = Parameters<VueInstance['$watch']>
export const watch = function (key: ToRefs<any>, callback: watchParams[1], options: watchParams[2]) {
  if (!currentInstance) throw new Error('watch 只能在 setup 中使用哦')

  // watch 依赖的实例属性
  if (!(currentInstance as any)._watchers) {
    (currentInstance as any)._watchers = []
  }

  let expOrFn

  if (isRef in key) {
    expOrFn = () => key.value
  } else if (isReactive in key) {
    options = options || {}
    options.deep = true
    expOrFn = () => key
  }

  const unWatch = currentInstance.$watch(expOrFn, callback, options);

  currentInstance.$once('hook:beforeDestroy', unWatch)
}

/**
 * 入口文件相关
 */
const proxyToThis = function (obj: object) {
  if (!currentInstance) throw new Error('setup 异常')

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

export const defineComponent = function <
  V extends Vue,
  Data=DefaultData<V>,
  Methods=DefaultMethods<V>,
  Computed=DefaultComputed,
  PropsDef=PropsDefinition<DefaultProps>,
  Props=DefaultProps
>(options: DefineComponentOptions<V,Data,Methods,Computed,PropsDef,Props>) {
  const { beforeCreate, setup, ...restOptions } = options

  return {
    beforeCreate: setup
      ? function (this: V) {
        beforeCreate && beforeCreate.call(this)

        currentInstance = this

        const options = setup.call(currentInstance, currentInstance.$props)

        proxyToThis(options)

        currentInstance = null
      } : undefined,
    ...restOptions
  }
}

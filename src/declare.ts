import { Vue } from 'vue/types/vue'
import { ComponentOptions } from 'vue/types/options'

export interface Ref<T = any> {
  value: T;
}

export type ToRefs<T = any> = {
  [K in keyof T]: Ref<T[K]>;
}

export interface DefineComponentOptions<
  V extends Vue,
  Data,
  Methods,
  Computed,
  PropsDef,
  Props,
> extends ComponentOptions<
  V,
  Data,
  Methods,
  Computed,
  PropsDef,
  Props
> {
  setup: (props: V['$props']) => object
}


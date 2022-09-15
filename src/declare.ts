import { Vue } from 'vue/types/vue'
import { ComponentOptions, DefaultProps } from 'vue/types/options'

export interface Ref<T = any> {
  value: T;
}

export type ToRefs<T = any> = {
  [K in keyof T]: Ref<T[K]>;
}

export interface DefineComponentOptions extends ComponentOptions<Vue> {
  setup: (props: DefaultProps) => object
}


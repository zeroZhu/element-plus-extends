import { Ref, ComputedRef } from 'vue';

declare global {
  type ExtractPropTypes<T extends Component> = T extends new (...args: any) => any
    ? Omit<InstanceType<T>['$props'], keyof VNodeProps>
    : never;

  type DynamicProps<T> = {
    [P in keyof T]: Ref<T[P]> | T[P] | ComputedRef<T[P]>;
  };
}
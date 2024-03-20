declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

/**
 *  键值对包装
 */
type Recordable<T = any> = Record<string, T>;

type Arrayable<T = any> = T | T[];

/**
 *  T | null 包装
 */
type Nullable<T> = T | null;

declare type EmitType = ReturnType<typeof defineEmits>;
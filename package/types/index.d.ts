/**
 *  键值对 包装
 */
type Recordable<T = any> = Record<string, T>;

type Arrayable<T = any> = T | T[];
/**
 *  T | null 包装
 */
type Nullable<T> = T | null;
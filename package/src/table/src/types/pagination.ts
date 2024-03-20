import type { PaginationProps as ElPaginationProps } from 'element-plus'

type PaginationPositon =
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export interface PaginationProps extends Partial<ElPaginationProps> {
  readonly position?: PaginationPositon
}

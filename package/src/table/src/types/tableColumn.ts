import { ExtractPropTypes } from 'vue';
import type { TableColumnInstance } from 'element-plus';
export interface BasicTableColumn extends Omit<ExtractPropTypes<TableColumnInstance>, '$el'> {
  type?: 'default' | 'selection' | 'index' | 'expand' | 'edit';
  rules?: any[];
  // 动态 Disabled
  editDynamicDisabled?: boolean | ((record: Recordable) => boolean);
}
import { ExtractPropTypes } from 'vue';
import type { PaginationProps } from './pagination';
import type { BasicTableColumn } from './tableColumn';
import type { FormProps } from '@/components/Form';
import { TableProps } from 'element-plus';

export interface BasicTableProps extends ExtractPropTypes<TableProps<any>> {
  // 请求接口
  api?: (...arg: any) => Promise<any>;
  // 请求前钩子
  beforeFetch?: (opt: Recordable) => any;
  // 请求后钩子
  afterFetch?: (opt: Recordable) => any;
  // 数据流
  data?: Recordable[];
  // 表格列配置
  columns?: BasicTableColumn[];
  // 分页配置
  pagination?: PaginationProps;
  // 请求字段配置
  fetchSetting?: FetchSetting;
  // loading初始值
  loading?: boolean;
  // 搜索相关信息
  searchInfo?: Recordable;
  // 默认排序
  defSort?: Recordable;
  // 是否使用搜索表格
  useSearchForm?: boolean;
  // 搜索表单配置
  formConfig?: FormProps
}

export interface FetchParams {
  searchInfo?: Recordable;
  page?: number;
  pageSize?: number;
  sortInfo?: Recordable;
  filterInfo?: Recordable;
}

export interface FetchSetting {
    // 请求接口当前页数
    pageField: string;
    // 每页显示多少条
    sizeField: string;
    // 请求结果列表字段  支持 a.b.c
    listField: string;
    // 请求结果总数字段  支持 a.b.c
    totalField: string;
}

export interface TableActionType {
  reload: (opt?: FetchParams) => Promise<Recordable[] | undefined>;
  setProps: (props: Partial<BasicTableProps>) => void;
}

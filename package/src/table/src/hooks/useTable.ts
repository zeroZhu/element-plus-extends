import { type WatchStopHandle, onUnmounted, ref, unref, watch } from 'vue';
import type { FormActionType } from '@/components/Form';
import type { BasicTableProps, FetchParams, TableActionType } from '../types/table';
import { isProdMode } from '@/utils/env';
import { getDynamicProps } from '@/utils';
import { error } from '@/utils/log';

type Props = Partial<DynamicProps<BasicTableProps>>

type RegisterFn = (tableInstance: TableActionType, formInstance: FormActionType) => void
export type UseTableReturnType = [RegisterFn, TableActionType]

export function useTable(props: Props): UseTableReturnType {
  const formRef = ref<Nullable<TableActionType>>(null);
  const tableRef = ref<Nullable<TableActionType>>(null);
  const loadedRef = ref<Nullable<boolean>>(false);
  // 停止监听
  let stopWatch: WatchStopHandle;
  // 注册函数
  function register(tableInstance: TableActionType, formInstance: any) {
    isProdMode() && onUnmounted(() => {
      formRef.value = null;
      tableRef.value = null;
    });
    // 如果已经加载&生成模式&tableInstance等于已缓存的tableRef 则return
    if (unref(loadedRef) && isProdMode() && tableInstance === unref(tableRef)) return;

    formRef.value = formInstance;
    tableRef.value = tableInstance;
    props && tableInstance.setProps(getDynamicProps(props));
    loadedRef.value = true;

    stopWatch?.();

    stopWatch = watch(
      () => props,
      () => props && tableInstance.setProps(getDynamicProps(props)),
      {
        immediate: true,
        deep: true,
      }
    )
  }
  // 获取table实例
  function getTableInstance(): TableActionType {
    const table = unref(tableRef);
    if(!table) error('Table实例还未被初始化，请确保Table已经被提前加载');
    return table as TableActionType;
  }

  const methods: TableActionType = {
    reload: async (opt?: FetchParams) => {
      return await getTableInstance().reload(opt);
    },
    setProps: (props: Partial<BasicTableProps>) => {
      getTableInstance().setProps(props);
    }
  }

  return [register, methods];
}

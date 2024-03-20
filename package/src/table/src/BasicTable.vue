<template>
  <div class="basic-table" ref="warpRef">
    <div class="rounded-lg basic-table__header" v-if="getBindValues.useSearchForm">
      <BasicForm ref="formRef"
        v-bind="getFormProps"
        @register="registerForm"
        @submit="handleSearchInfoChange"
      >
        <template v-for="item in getFormSlotKeys" #[replaceFormSlotKey(item)]="data">
          <slot :name="item" v-bind="data || {}"></slot>
        </template>
      </BasicForm>
    </div>
    <div class="basic-table__body table-wrapper">
      <ElTable ref="tableRef" v-bind="getBindValues">
        <ElTableColumn v-for="column in getColumns" :key="column.prop" v-bind="column"></ElTableColumn>
        <slot></slot>
      </ElTable>
      <div :class="`mt-12 flex ${posPagination}`">
        <ElPagination v-if="getPaginationShow()" v-bind="getPaginationBindValues" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { BasicTableProps, TableActionType } from './types/table'

import { computed, ref, unref, useSlots } from 'vue'
import { BasicForm, useForm } from '@/components/Form'
import { ElTable, ElTableColumn, ElPagination } from 'element-plus'

import { useData } from './hooks/useData'
import { useLoading } from './hooks/useLoading'
import { usePagination } from './hooks/usePagination'
import { useTableEvents } from './hooks/useTableEvents'
import { useTableForm } from './hooks/useTableForm'
import { basicProps } from './props'
import { isBoolean } from '@/utils/is'

defineOptions({ name: 'BasicTable' });

const props = withDefaults(defineProps<BasicTableProps>(), basicProps);
const emit = defineEmits(['fetch-success', 'fetch-error', 'selection-change', 'register', 'row-click', 'row-dbClick', 'row-contextmenu', 'row-mouseenter', 'row-mouseleave', 'edit-end', 'edit-cancel', 'edit-row-end', 'edit-change', 'expanded-rows-change', 'pagination-change', 'columns-change'])

const slots = useSlots();

const warpRef = ref();
const formRef = ref();
const tableRef = ref();
const tableData = ref([]);

const innerProps = ref<Partial<BasicTableProps>>();

const [registerForm, { getFieldsValue }] = useForm();

const getProps = computed<BasicTableProps>(() => ({ ...props, ...unref(innerProps) }));
const getColumns = computed(() => {
  return unref(getProps).columns || [];
});
// loading钩子
const { getLoading, setLoading } = useLoading(getProps);
// 分页钩子
const { getPagination, setPagination, setPaginationShow, getPaginationShow } = usePagination(getProps);
// selection钩子
const { selectionChange, clearSelection } = useTableEvents(getProps, { tableRef, tableData }, emit);
// 数据源钩子
const { reload, fetch, handleSortChange, handleFilterChange, handlePagnitionChange } = useData(
  getProps,
  {
    tableData,
    getPagination,
    setPagination,
    setLoading,
    getFieldsValue,
    clearSelection,
  },
  emit
);

const { getFormProps, replaceFormSlotKey, getFormSlotKeys, handleSearchInfoChange } =
    useTableForm(getProps, slots, fetch, getLoading);

// table绑定值
const getBindValues = computed(() => {
  const data = unref(tableData);
  return {
    ...unref(getProps),
    data,
    onSelectionChange: selectionChange,
    onSortChange: handleSortChange,
    onFilterChange: handleFilterChange,
  }
})

// pagination绑定值
const getPaginationBindValues = computed(() => {
  const pagination = unref(getPagination);
  return {
    ...(isBoolean(pagination) ? {} : pagination),
    onChange: handlePagnitionChange
  }
});
const posPagination = computed(() => {
  const pagination = unref(getPagination) || {};
  const position = isBoolean(pagination) ? 'bottom-right' : pagination.position;
  switch (position) {
    case 'bottomLeft':
      return 'justify-start';
    case 'bottomCenter':
      return 'justify-center';
    case 'bottomRight':
      return 'justify-end';
    default:
      return 'justify-end';
  };
});
// 设置props
function setProps(props: Partial<BasicTableProps>) {
  innerProps.value = { ...unref(innerProps), ...props }
}

const tableAction: TableActionType = {
  setProps,
  reload,
}

emit('register', tableAction);

defineExpose({ tableAction, ...tableAction });
</script>

<style lang="less" scoped>
.basic-table {
  &__header, &__body {
    background-color: #FFFFFF;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  &__header {
    padding: 16px 23px;
    margin-bottom: 12px;
  }
  &__body {
    padding: 16px 23px 47px 23px;

  }
}
</style>

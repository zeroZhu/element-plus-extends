import { type Ref, ref, unref, type ComputedRef } from 'vue'
import type { BasicTableProps } from '../types/table'
import { error } from '@/utils/log'

interface ActionType {
  tableRef: Ref<any>
  tableData: Ref<Recordable[]>
}

export function useTableEvents(props: ComputedRef<BasicTableProps>, { tableRef, tableData }: ActionType, emit: EmitType) {
  // 获取table实例
  function getTableInstance() {
    const table = unref(tableRef)
    if (!table) error('Table实例还未被初始化，请确保Table已经被提前加载')
    return table
  }

  /**
   * Selection相关
   * */
  const selectedRowsRef = ref()
  const selectedRowKeysRef = ref()

  // 选择变化事件
  function selectionChange(selection: any[]) {
    selectedRowsRef.value = selection
    emit('selection-change', unref(selectedRowsRef), unref(selectedRowKeysRef))
  }

  // 设置选中
  function setSelectionRows(rows: any, falg: boolean) {
    getTableInstance().toggleRowSelection(rows, falg)
  }
  function setSelectionRowKeys(rows: any, falg: boolean) {
    getTableInstance().toggleRowSelection(rows, falg)
  }

  // 获取选中
  function getSelectionRows() {
    return unref(selectedRowsRef) ? unref(selectedRowsRef) : getTableInstance().getSelectionRows()
  }
  function getSelectionRowKeys() {
    return unref(selectedRowsRef) ? unref(selectedRowsRef) : getTableInstance().getSelectionRows()
  }

  // 清除选中
  function clearSelection() {
    getTableInstance().clearSelection()
  }

  /**
   * Scroll相关
   * */
  function scrollTo() {
    getTableInstance().scrollTo()
  }

  function setScrollTop(top: number) {
    getTableInstance().setScrollTop(top)
  }

  function setScrollLeft(left: number) {
    getTableInstance().setScrollTop(left)
  }

  return { selectionChange, setSelectionRows, setSelectionRowKeys, getSelectionRows, getSelectionRowKeys, clearSelection, scrollTo, setScrollTop, setScrollLeft }
}

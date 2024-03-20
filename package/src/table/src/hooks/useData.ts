import { type ComputedRef, type Ref, reactive, ref, unref, watchEffect, watch } from "vue";
import { BasicTableProps, FetchParams } from "../types/table";
import { PaginationProps } from "../types/pagination";
import { isBoolean, isFunction } from "@/utils/is";
import { FETCH_SETTING } from "@/settings/table";
import { get, merge } from "lodash-es";

interface ActionType {
  getPagination: ComputedRef<boolean | PaginationProps>
  setPagination: (info: Partial<PaginationProps>) => void;
  setLoading: (loading: boolean) => void;
  getFieldsValue: () => Recordable;
  clearSelection: () => void;
  tableData: Ref<Recordable[]>;
}

interface SearchState {
  sortInfo: Recordable;
  filterInfo: Record<string, string[]>;
}

export function useData(
  props: ComputedRef<BasicTableProps>,
  {
    getPagination,
    setPagination,
    setLoading,
    getFieldsValue,
    clearSelection,
    tableData,
  }: ActionType,
  emit: EmitType
) {
  const searchState = reactive<SearchState>({
    sortInfo: {},
    filterInfo: {},
  });
  const dataRef = ref<Recordable[]>([]);
  const rawDataRef = ref<Recordable>({});

  watchEffect(() => {
    tableData.value = unref(dataRef);
  });

  // 监听数据data
  watch(() => unref(props).data, () => {
    const { data, api } = unref(props);
    !api && data && (dataRef.value = data)
  }, { immediate: true });

  // 没有api的情况下
  watch(
    () => unref(props).api,
    () => {
      const { api, data } = unref(props);
      !api && data && (dataRef.value = data);
    },
    {
      immediate: true,
    },
  )

  function handleSortChange() {
    console.log('arg====', arguments)
  }

  function handleFilterChange() {
    console.log('arg====', arguments)
  }

  function handlePagnitionChange(currentPage: number, pageSize: number) {
    setPagination({ currentPage, pageSize });

    emit('pagination-change', currentPage, pageSize);
    fetch();
  }

  async function fetch(opt?: FetchParams): Promise<Recordable[] | undefined> {
    const {
      api,
      searchInfo,
      defSort,
      fetchSetting,
      beforeFetch,
      afterFetch,
      useSearchForm,
      pagination,
    } = unref(props);

    if(!api || !isFunction(api)) return;

    try {
      setLoading(true);
      const { pageField, sizeField, listField, totalField } = Object.assign({}, FETCH_SETTING, fetchSetting);
      const pageParams: Recordable = {};
      const { currentPage = 1, pageSize = 10 } = unref(getPagination) as PaginationProps;

      if (!(isBoolean(pagination) && !pagination) || isBoolean(getPagination)) {
        pageParams[pageField] = (opt && opt.page) || currentPage;
        pageParams[sizeField] = pageSize;        
      }

      const { sortInfo = {}, filterInfo } = searchState;

      let params: Recordable = merge(
        pageParams,
        useSearchForm ? getFieldsValue() : {},
        searchInfo,
        opt?.searchInfo ?? {},
        defSort,
        sortInfo,
        filterInfo,
        opt?.sortInfo ?? {},
        opt?.filterInfo ?? {},
      );

      if (beforeFetch && isFunction(beforeFetch)) {
        params = (await beforeFetch(params)) || params;
      }

      const res = await api(params);
      rawDataRef.value = res;

      const isArrayResult = Array.isArray(res);
      let resultItems = isArrayResult ? res : get(res, listField);
      const resultTotal = isArrayResult ? res.length : get(res, totalField);

      if (Number(resultTotal)) {
        const currentTotalPage = Math.ceil(resultTotal / pageSize);
        if (currentPage > currentTotalPage) {
          setPagination({
            currentPage: currentTotalPage,
          });
          return await fetch(opt);
        }
      }

      if (afterFetch && isFunction(afterFetch)) {
        resultItems = (await afterFetch(resultItems)) || resultItems;
      }

      dataRef.value = resultItems;

      setPagination({ currentPage: opt?.page || 1, total: resultTotal || 0 });

      emit('fetch-success', {
        items: unref(resultItems),
        total: resultTotal,
      });
      return resultItems;
    } catch (error) {
      emit('fetch-error', error);
      dataRef.value = [];
      setPagination({ total: 0 });
    } finally {
      setLoading(false);
    }
  }

  async function reload(opt?: FetchParams) {
    return await fetch(opt);
  }


  return { fetch, reload, handleSortChange, handleFilterChange, handlePagnitionChange }
}

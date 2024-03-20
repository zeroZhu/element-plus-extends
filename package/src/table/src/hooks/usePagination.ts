import { ComputedRef, computed, ref, unref, watch } from 'vue'
import type { BasicTableProps } from '../types/table'
import type { PaginationProps } from '../types/pagination'

import { isBoolean } from '@/utils/is'

export function usePagination(props: ComputedRef<BasicTableProps>) {
  const paginationProps = ref()
  const show = ref(true)

  watch(
    () => unref(props).pagination,
    (pagination) => {
      if (!isBoolean(pagination) && pagination) {
        paginationProps.value = {
          ...unref(paginationProps),
          ...pagination,
        }
      }
    }
  )

  const getPagination = computed((): PaginationProps | boolean => {
    const { pagination } = unref(props);

    if (!unref(show) || (isBoolean(pagination) && !pagination)) {
      return false;
    }

    return {
      current: 1,
      pageSize: 10,
      total: 0,
      background: true,
      ...(isBoolean(pagination) ? {} : pagination),
      ...unref(paginationProps),
    }
  })

  const setPagination = (info: Partial<PaginationProps>) => {
    const pagination = unref(getPagination);
    paginationProps.value = {
      ...(!isBoolean(pagination) ? pagination : {}),
      ...info,
    }
  }

  const getPaginationShow = () => unref(show);

  const setPaginationShow = (val: boolean) => show.value = val;

  return { getPagination, setPagination, getPaginationShow, setPaginationShow };
}

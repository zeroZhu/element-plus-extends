import { ComputedRef, computed, ref, unref, watch } from "vue";
import type { BasicTableProps } from '../types/table'

export function useLoading(props: ComputedRef<BasicTableProps>) {
  const loadingRef = ref(unref(props).loading);

  watch(
    () => unref(props).loading,
    (val) => loadingRef.value = val,
  );

  const getLoading = computed(() => unref(loadingRef));

  const setLoading = (val: boolean) => loadingRef.value = val;

  return { getLoading, setLoading };
}
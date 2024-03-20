<template>
  <ElSelect v-bind="$attrs" v-model="value" :options="getOptions" @change="handleChange" @visible-change="handleVisibleChange">
    
  </ElSelect>
</template>

<script lang="ts" setup>
import { computed, ref, unref, watch } from 'vue';
import { ElSelect } from 'element-plus';
import { get, isEqual, omit, toString, isFunction } from 'lodash-es';
import { useRuleFormItem } from '../hooks/useFormItem';


type OptionsItem = {
  label?: string;
  value?: string;
  disabled?: boolean;
  [key: string]: any;
}
defineOptions({ name: 'ApiSelect', inheritAttrs: false });

type Props = {
  value: string | number | Recordable | Arrayable;
  numberToString: boolean;
  api: (arg?: any) => Promise<Recordable>;
  params: Recordable;
  immediate: boolean;
  resultField: string;
  labelField: string;
  valueField: string;
  alwaysLoad: boolean;
  options: OptionsItem[];
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true,
  resultField: '',
  labelField: 'label',
  valueField: 'value',
  alwaysLoad: false,
  options: () => []
});

const emit = defineEmits(['update:value', 'options-change', 'change', 'load-data']);

const optionsRef = ref<OptionsItem[]>([]);

const loading = ref(false);
// 是否首次加载
const isFirstLoaded = ref(false);
const emitData = ref<OptionsItem[]>([]);

// Embedded in the form, just use the hook binding to perform form verification
const [state] = useRuleFormItem(props, 'value', 'change', emitData);

const getOptions = computed(() => {
  const { labelField, valueField, numberToString } = props;

  return unref(optionsRef) && unref(optionsRef).length ? unref(optionsRef).reduce((prev, next) => {
    if (next) {
      const value = get(next, valueField);
      prev.push({
        label: get(next, labelField),
        value: numberToString ? toString(value) : value,
        ...omit(next, [labelField, valueField])
      })
    }
    return prev;
  }, [] as OptionsItem[]) : props.options;
});

function emitChange() {
  emit('options-change', unref(getOptions));
}

watch(
  () => state.value,
  (v) => {
    emit('update:value', v);
  },
);

watch(
  () => props.params,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) return;
    fetch();
  },
  { deep: true, immediate: props.immediate },
);

async function fetch() {
  const api = props.api;
  if (!api || !isFunction(api) || loading.value) return;
  optionsRef.value = [];
  try {
    loading.value = true;
    const res = await api(props.params);
    isFirstLoaded.value = true;

    if (props.resultField) {
      optionsRef.value = get(res, props.resultField) || [];
    } else {
      if (Array.isArray(res)) optionsRef.value = res;
    }
    emitChange();
  } catch (error) {
    console.warn(error);
  } finally {
    loading.value = false;
    // reset status
    isFirstLoaded.value = false;
  }
}

async function handleVisibleChange(visible: boolean) {
  if (visible) {
    if (props.alwaysLoad) {
      await fetch();
    } else if (!props.immediate && !unref(isFirstLoaded)) {
      await fetch();
    }
  }
}

function handleChange(val: any) {
  console.log('val===', val)
  // emitData.value = val;
}
</script>

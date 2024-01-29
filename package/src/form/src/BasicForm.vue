<template>
  <ElForm
    v-bind="getBindValue"
    ref="formElRef"
    :model="formModel"
  >
    <ElRow v-bind="getRow">
      <slot name="formHeader"></slot>
      <template v-for="schema in getSchema" :key="schema.field">
        <FormItem
          :isAdvanced="fieldsIsAdvancedMap[schema.field]"
          :tableAction="props.tableAction"
          :formAction="formAction"
          :schema="schema"
          :formProps="getProps"
          :allDefaultValues="defaultValueRef"
          :formModel="formModel"
          :setFormModel="setFormModel"
        >
          <template #[item]="data" v-for="item in Object.keys($slots)">
            <slot :name="item" v-bind="data || {}"></slot>
          </template>
        </FormItem>
      </template>
      <FormAction v-bind="getFormActionBindProps" @toggle-advanced="handleToggleAdvanced">
        <template
          #[item]="data"
          v-for="item in ['resetBefore', 'submitBefore', 'advanceBefore', 'advanceAfter']"
        >
          <slot :name="item" v-bind="data || {}"></slot>
        </template>
      </FormAction>
      <slot name="formFooter"></slot>
    </ElRow>
  </ElForm>
</template>

<script lang="ts" setup>
  import type { FormProps, FormSchemaInner as FormSchema, FormActionType } from './types/form';
  import { isIncludeSimpleComponents, type AdvanceState } from './types/hooks';

  import { computed, reactive, ref, unref, useAttrs } from 'vue';
  import { ElForm, ElRow } from 'element-plus';
  import FormItem from './components/FormItem.vue';
  import FormAction from './components/FormAction.vue';

  import { basicProps } from './props';

  import { cloneDeep } from 'lodash-es';
  import { dateUtil } from '@package/utils/date'
  import useAdvanced from './hooks/useAdvanced';

  defineOptions({ name: 'BasicForm' });

  const emit = defineEmits([
    'advanced-change',
    'reset',
    'submit',
    'register',
    'field-value-change',
  ])

  const attrs = useAttrs();
  const props = withDefaults(defineProps<FormProps>(), basicProps)
  // 内部绑定的props
  const propsRef = ref<Partial<FormProps>>();
  // 内部缓存的schema
  const schemaRef = ref<FormSchema[] | null>(null);
  // 内部缓存的默认值
  const defaultValueRef = ref({});
  // 获取传入的props
  const getProps = computed(() => {
    return { ...props, ...unref(propsRef) } as FormProps;
  });
  const formModel = reactive({});

  const getRow = computed(() => {
    const { baseRowStyle = {}, rowProps } = unref(getProps);
    return {
      style: baseRowStyle,
      ...rowProps,
    };
  })

  const getBindValue = computed(() => ({ ...attrs, ...props, ...unref(getProps) }) as FormProps);
  // 获取schema配置
  const getSchema = computed((): FormSchema[] => {
    const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any);
    for (const schema of schemas) {
      const {
        defaultValue,
        component,
        componentProps = {},
        isHandleDateDefaultValue = true,
      } = schema;
      // 处理日期类型数据
      if (
        isHandleDateDefaultValue &&
        defaultValue &&
        component &&
        ['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker'].includes(component)
      ) {
        const opt = {
          schema,
          tableAction: props.tableAction ?? ({} as any),
          formModel,
          formActionType: {} as FormActionType,
        };
        const valueFormat = componentProps
          ? typeof componentProps === 'function'
            ? componentProps(opt)['valueFormat']
            : componentProps['valueFormat']
          : null;
        if (!Array.isArray(defaultValue)) {
          schema.defaultValue = valueFormat
            ? dateUtil(defaultValue).format(valueFormat)
            : dateUtil(defaultValue);
        } else {
          const def: any[] = [];
          defaultValue.forEach((item) => {
            def.push(valueFormat ? dateUtil(item).format(valueFormat) : dateUtil(item));
          });
          schema.defaultValue = def;
        }
      }
    }
    // 如果显示
    if (unref(getProps).showAdvancedButton) {
      return cloneDeep(
        schemas.filter((schema) => !isIncludeSimpleComponents(schema.component)) as FormSchema[],
      );
    } else {
      return cloneDeep(schemas as FormSchema[]);
    }
  });
  // 展开/收起 按钮状态
  const advanceState = reactive<AdvanceState>({
    isAdvanced: true,
    hideAdvanceBtn: false,
    isLoad: false,
    actionSpan: 6,
  })  
  const { handleToggleAdvanced, fieldsIsAdvancedMap } = useAdvanced({
    advanceState,
    emit,
    getProps,
    getSchema,
    formModel,
    defaultValueRef,
  });
  const getFormActionBindProps = computed(() => ({ ...getProps.value, ...advanceState }) as InstanceType<typeof FormAction>['$props'])

  const formAction = {} as any;

  function setFormModel(key: string, value: any, schema: FormSchema) {
    console.log(key, value, schema);
  }
</script>

<template>
  <ElForm v-bind="getBindValue" ref="formElRef" :model="formModel" @keypress.enter="handleEnterPress">
    <ElRow v-bind="getRow">
      <slot name="formHeader"></slot>
      <template v-for="schema in getSchema" :key="schema.field">
        <FormItem :isAdvanced="fieldsIsAdvancedMap[schema.field]" :tableAction="tableAction" :formAction="formAction" :schema="schema" :formProps="getProps" :allDefaultValues="defaultValueRef" :formModel="formModel" :setFormModel="setFormModel">
          <template #[item]="data" v-for="item in Object.keys($slots)">
            <slot :name="item" v-bind="data || {}"></slot>
          </template>
        </FormItem>
      </template>
      <FormAction v-bind="getFormActionBindProps" @toggle-advanced="handleToggleAdvanced">
        <template #[item]="data" v-for="item in ['resetBefore', 'submitBefore', 'advanceBefore', 'advanceAfter']">
          <slot :name="item" v-bind="data || {}"></slot>
        </template>
      </FormAction>
      <slot name="formFooter"></slot>
    </ElRow>
  </ElForm>
</template>

<script lang="ts" setup>
import type { FormProps, FormSchemaInner as FormSchema, FormActionType } from './types/form'
import { isIncludeSimpleComponents, type AdvanceState } from './types/hooks'

import { type Ref, computed, reactive, ref, unref, useAttrs, watch, onMounted } from 'vue'
import { ElForm, ElRow } from 'element-plus'
import FormItem from './components/FormItem.vue'
import FormAction from './components/FormAction.vue'

import { basicProps } from './props'

import { cloneDeep, debounce } from 'lodash-es'
import { dateUtil } from '@/utils/date'
import useAdvanced from './hooks/useAdvanced'
import { useFormValues } from './hooks/useFormValues'
import { useFormEvents } from './hooks/useFormEvents'
import { createFormContext } from './hooks/useFormContext'
import { deepMerge } from '@/utils'

defineOptions({ name: 'BasicForm' })
const emit = defineEmits(['advanced-change', 'reset', 'submit', 'register', 'field-value-change'])

const attrs = useAttrs()
const props = withDefaults(defineProps<FormProps>(), basicProps)
const isInitedDefaultRef = ref(false)
// 内部绑定的props
const propsRef = ref<Partial<FormProps>>()
// 内部缓存的schema
const schemaRef = ref<FormSchema[] | null>(null)
// 表单的ref缓存
const formElRef = ref<FormActionType | null>(null)
// 内部缓存的默认值
const defaultValueRef = ref({})
// 获取传入的props
const getProps = computed(() => {
  return { ...props, ...unref(propsRef) } as FormProps
})
const formModel = reactive<Recordable>({})

const getRow = computed(() => {
  const { baseRowStyle = {}, rowProps } = unref(getProps)
  return {
    style: baseRowStyle,
    ...rowProps,
  }
})

const getBindValue = computed(() => ({ ...attrs, ...props, ...unref(getProps) } as FormProps))
// 获取schema配置
const getSchema = computed((): FormSchema[] => {
  const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any)
  for (const schema of schemas) {
    const { defaultValue, component, componentProps = {}, isHandleDateDefaultValue = true } = schema
    // 处理日期类型数据
    if (isHandleDateDefaultValue && defaultValue && component && ['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker'].includes(component)) {
      const opt = {
        schema,
        tableAction: props.tableAction ?? ({} as any),
        formModel,
        formActionType: {} as FormActionType,
      }
      const valueFormat = componentProps ? (typeof componentProps === 'function' ? componentProps(opt)['valueFormat'] : componentProps['valueFormat']) : null
      if (!Array.isArray(defaultValue)) {
        schema.defaultValue = valueFormat ? dateUtil(defaultValue).format(valueFormat) : dateUtil(defaultValue)
      } else {
        const def: any[] = []
        defaultValue.forEach((item) => {
          def.push(valueFormat ? dateUtil(item).format(valueFormat) : dateUtil(item))
        })
        schema.defaultValue = def
      }
    }
  }
  // 如果显示
  if (unref(getProps).showAdvancedButton) {
    return cloneDeep(schemas.filter((schema) => !isIncludeSimpleComponents(schema.component)) as FormSchema[])
  } else {
    return cloneDeep(schemas as FormSchema[])
  }
})
// 展开/收起 按钮状态
const advanceState = reactive<AdvanceState>({
  isAdvanced: true,
  hideAdvanceBtn: false,
  isLoad: false,
  actionSpan: 6,
})

// 展开收起控制
const { handleToggleAdvanced, fieldsIsAdvancedMap } = useAdvanced({
  advanceState,
  emit,
  getProps,
  getSchema,
  formModel,
  defaultValueRef,
})

// 表单默认值与初始化处理
const { handleFormValues, initDefault } = useFormValues({ getProps, defaultValueRef, getSchema, formModel })

// 表单事件
const { handleSubmit, setFieldsValue, clearValidate, validate, validateField, getFieldsValue, updateSchema, resetSchema, appendSchemaByField, removeSchemaByField, resetFields, scrollToField } = useFormEvents({
  emit,
  getProps,
  formModel,
  getSchema,
  defaultValueRef,
  formElRef: formElRef as Ref<FormActionType>,
  schemaRef: schemaRef as Ref<FormSchema[]>,
  handleFormValues,
})

createFormContext({
  resetAction: resetFields,
  submitAction: handleSubmit,
})

// 监听model
watch(
  () => unref(getProps).model,
  () => {
    const { model } = unref(getProps)
    if (!model) return
    setFieldsValue(model)
  },
  {
    immediate: true,
  }
)

// 监听schemas
watch(
  () => props.schemas,
  (schemas) => {
    resetSchema(schemas ?? [])
  }
)

// 监听
watch(
  () => getSchema.value,
  (schema) => {
    if (unref(isInitedDefaultRef)) {
      return
    }
    if (schema?.length) {
      initDefault()
      isInitedDefaultRef.value = true
    }
  }
)

watch(
  () => formModel,
  debounce(() => {
    unref(getProps).submitOnChange && handleSubmit()
  }, 300),
  { deep: true }
)

async function setProps(formProps: Partial<FormProps>): Promise<void> {
  propsRef.value = deepMerge(unref(propsRef) || {}, formProps)
}

function setFormModel(key: string, value: any, schema: FormSchema) {
  formModel[key] = value
  emit('field-value-change', key, value)
  // TODO 优化验证，这里如果是autoLink=false手动关联的情况下才会再次触发此函数
  if (schema && schema.itemProps && !schema.itemProps.autoLink) {
    validateField([key]).catch((_) => {})
  }
}

function handleEnterPress(e: KeyboardEvent) {
  const { autoSubmitOnEnter } = unref(getProps)
  if (!autoSubmitOnEnter) return
  if (e.key === 'Enter' && e.target && e.target instanceof HTMLElement) {
    const target: HTMLElement = e.target as HTMLElement
    if (target && target.tagName && target.tagName.toUpperCase() == 'INPUT') {
      handleSubmit()
    }
  }
}

const getFormActionBindProps = computed(() => {
  return {
    ...getProps.value,
    ...advanceState,
  } as InstanceType<typeof FormAction>['$props']
})

const formAction = {
  getFieldsValue,
  setFieldsValue,
  resetFields,
  updateSchema,
  resetSchema,
  setProps,
  appendSchemaByField,
  removeSchemaByField,
  clearValidate,
  validate,
  validateField,
  submit: handleSubmit,
  scrollToField: scrollToField,
}

defineExpose({ ...formAction })

onMounted(() => {
  initDefault()
  emit('register', formAction)
})
</script>

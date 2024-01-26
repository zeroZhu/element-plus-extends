<template>
  <div></div>
</template>
<script setup lang="tsx">
import { computed, unref } from "vue";
import type {
  FormActionType,
  FormProps,
  FormSchemaInner as FormSchema,
} from "../types/form";
import type { FormItemRule as ValidationRule } from "element-plus/lib/components/form";
import { isBoolean, isFunction, isEmpty } from "@package/utils/is";
import { isIncludeSimpleComponents } from "../types/hooks";

import { createPlaceholderMessage, isComponentFormSchema } from "../hooks/useForm";
import { cloneDeep } from "lodash-es";

defineOptions({
  name: "BasicFormItem",
  inheritAttrs: false,
});
// 声明props
const props = withDefaults(
  defineProps<{
    schema: FormSchema;
    formProps: FormProps;
    allDefaultValues: Recordable;
    formModel: Recordable;
    tableAction: any;
    formActionType: FormActionType;
    isAdvanced: boolean;
    setFormModel: (key: string, value: any, schema: FormSchema) => void;
  }>(),
  {
    formProps: () => ({}),
    allDefaultValues: () => ({}),
    formModel: () => ({}),
  }
);

// 获取渲染组件props
const getComponentsProps = computed(() => {
  const { schema, tableAction, formModel, formActionType } = props;
  let { componentProps = {} } = schema;
  // componentProps 可以是props对象/返回props的函数
  if (isFunction(componentProps)) {
    componentProps =
      componentProps({ schema, tableAction, formModel, formActionType }) ?? {};
  }
  // 判断是否是简单组件：标题、分割线
  if (isIncludeSimpleComponents(schema.component)) {
    componentProps = Object.assign(
      { type: "horizontal" },
      {
        orientation: "left",
        plain: true,
      },
      componentProps
    );
  }
  return componentProps as Recordable<any>;
});

// 判断是否禁用
const getDisable = computed(() => {
  // 表单整个是否禁用
  const { disabled: globDisabled } = props.formProps;
  // 单个schema是否禁用
  const { dynamicDisabled } = props.schema;
  // 组件props是否禁用
  const { disabled: itemDisabled = false } = unref(getComponentsProps);
  let disabled = !!globDisabled || itemDisabled;
  if (isBoolean(dynamicDisabled)) {
    disabled = dynamicDisabled;
  }
  if (isFunction(dynamicDisabled)) {
    disabled = dynamicDisabled(unref(getValues));
  }
  return disabled;
});

// 判断是否只读
const getReadonly = computed(() => {
  const { readonly: globReadonly } = props.formProps;
  const { dynamicReadonly } = props.schema;
  const { readonly: itemReadonly = false } = unref(getComponentsProps);

  let readonly = globReadonly || itemReadonly;
  if (isBoolean(dynamicReadonly)) {
    readonly = dynamicReadonly;
  }
  if (isFunction(dynamicReadonly)) {
    readonly = dynamicReadonly(unref(getValues));
  }
  return readonly;
});

// 判断是否显示
function getShow(): { isShow: boolean; isIfShow: boolean } {
  // 获取单个schema中show if
  const { show, ifShow } = props.schema;
  // 获取单个schema是否折叠
  const { showAdvancedButton } = props.formProps;
  const itemIsAdvanced = showAdvancedButton
    ? isBoolean(props.isAdvanced)
      ? props.isAdvanced
      : true
    : true;

  let isShow = true;
  let isIfShow = true;

  if (isBoolean(show)) {
    isShow = show;
  }
  if (isBoolean(ifShow)) {
    isIfShow = ifShow;
  }
  if (isFunction(show)) {
    isShow = show(unref(getValues));
  }
  if (isFunction(ifShow)) {
    isIfShow = ifShow(unref(getValues));
  }
  isShow = isShow && itemIsAdvanced;
  return { isShow, isIfShow };
}
// 处理校验rules
function handleRules(): ValidationRule[] {
  const {
    rules: defRules = [],
    component,
    rulesMessageJoinLabel,
    label,
    dynamicRules,
    required,
  } = props.schema;
  // 判断dynamicRules是否为函数 如果是函数有限取函数返回的rules
  if (isFunction(dynamicRules)) {
    return dynamicRules(unref(getValues)) as ValidationRule[];
  }
  // 初始化rules
  let rules: ValidationRule[] = cloneDeep(defRules) as ValidationRule[];
  // 是否将表单label拼接到提示信息后
  const { rulesMessageJoinLabel: globalRulesMessageJoinLabel } =
    props.formProps;
  // 用schema中的设置覆盖formProps中的设置
  const joinLabel = Reflect.has(props.schema, "rulesMessageJoinLabel") ? rulesMessageJoinLabel : globalRulesMessageJoinLabel;
  // 初始化默认提示
  const assertLabel = joinLabel ? label : '';
  const defaultMsg = component ? createPlaceholderMessage(component) + assertLabel : assertLabel;

  function validator(rule: any, value: any) {
    const msg = rule.message || defaultMsg;
    if (isEmpty(value)) {
      return Promise.reject(msg);
    } else if(
      typeof value === 'object' &&
      Reflect.has(value, 'checked') &&
      Reflect.has(value, 'halfChecked') &&
      Array.isArray(value.checked) &&
      Array.isArray(value.halfChecked) &&
      value.checked.length === 0 &&
      value.halfChecked.length === 0
    ) {
      return Promise.reject(msg);
    }
    return Promise.resolve();
  }
  // 判定是否必须
  const getRequired = isFunction(required) ? required(unref(getValues)) : required;

  /* 
  * 1.设置了require，没有rules默认给一个rule
  * 2.设置了require，也有其他rules，以rule为优先
  * */
 if (getRequired) {
  if (isEmpty(rules)) {
    // const tigger = NO_AUTO_LINK_COMPONENTS.includes(component || 'Input') ? 'blur' : 'change';
    rules = [{ required: getRequired, asyncValidator: validator, trigger: ['blur', 'change'] }];
  } else {
    const requiredIndex = rules.findIndex(rule => Reflect.has(rule, 'required'));
    if (requiredIndex) rules.push({ required: true, asyncValidator: validator });
  }
 }
}

const { autoSetPlaceHolder, size } = props.formProps;
const propsData: Recordable<any> = {
  allowClear: true,
  size,
  ...unref(getComponentsProps),
  disabled: unref(getDisable),
  readonly: unref(getReadonly),
};

const getValues = computed(() => {
  const { allDefaultValues, formModel, schema } = props;
  const { mergeDynamicData } = props.formProps;
  return {
    field: schema.field,
    model: formModel,
    values: {
      ...mergeDynamicData,
      ...allDefaultValues,
      ...formModel,
    } as Recordable<any>,
    schema: schema,
  };
});

function renderComponent() {
  if (!isComponentFormSchema(props.schema)) {
    return null;
  }
  const {
    renderComponentContent,
    component,
    field,
    changeEvent = "change",
    valueField,
  } = props.schema;
  // 判断是否是选择类型
  const isCheck = component && ["Switch", "Checkbox"].includes(component);
  // 格式化变更事件
  const eventKey = `on${upperFirst(changeEvent)}`;
  const on = {
    [eventKey]: (...args: Nullable<Recordable<any>>[]) => {
      const [e] = args;
      if (propsData[eventKey]) {
        propsData[eventKey](...args);
      }
      const target = e ? e.target : null;
      const value = target ? (isCheck ? target.checked : target.value) : e;
      props.setFormModel(field, value, props.schema);
    },
  };
}
</script>

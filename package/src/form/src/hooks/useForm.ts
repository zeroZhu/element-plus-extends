import type { ComponentType } from '../types';
import type { ComponentFormSchema, FormSchemaInner, SlotFormSchema } from '../types/form';
import type { FormItemRule as ValidationRule } from "element-plus/lib/components/form";

export function isSlotFormSchema(
  schema: FormSchemaInner
): schema is SlotFormSchema {
  return "slot" in schema;
}

export function isComponentFormSchema(
  schema: FormSchemaInner
): schema is ComponentFormSchema {
  return !isSlotFormSchema(schema);
}

/**
 * @description: 生成placeholder
 */
export function createPlaceholderMessage(component: ComponentType) {
  if (component.includes('Input') || component.includes('Complete')) {
    return '请输入';
  }
  if (component.includes('Picker')) {
    return '请选择';
  }
  if (
    component.includes('Select') ||
    component.includes('Cascader') ||
    component.includes('Checkbox') ||
    component.includes('Radio') ||
    component.includes('Switch')
  ) {
    // return `请选择${label}`;
    return '请选择';
  }
  return '';
}

/**
 * @description: 根据组件类型设置校验类型
 */
export function setComponentRuleType(
  rule: ValidationRule,
  component: ComponentType,
  valueFormat: string,
) {
  if (Reflect.has(rule, 'type')) {
    return;
  }
  if (['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker'].includes(component)) {
    rule.type = valueFormat ? 'string' : 'object';
  } else if (['RangePicker', 'Upload', 'CheckboxGroup', 'TimePicker'].includes(component)) {
    rule.type = 'array';
  } else if (['InputNumber'].includes(component)) {
    rule.type = 'number';
  }
}

// TODO 自定义组件封装会出现验证问题，因此这里目前改成手动触发验证
export const NO_AUTO_LINK_COMPONENTS: ComponentType[] = [
  'ApiSelect',
];

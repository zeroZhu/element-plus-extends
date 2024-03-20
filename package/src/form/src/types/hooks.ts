import { isNumber } from 'lodash-es';
import type { ComponentType } from './index';
import { FormSchemaInner as FormSchema } from './form';

export interface AdvanceState {
  isAdvanced: boolean;
  hideAdvanceBtn: boolean;
  isLoad: boolean;
  actionSpan: number;
}

export const simpleComponents = ['Divider', 'BasicTitle'];

export const defaultValueComponents = ['Autocomplete', 'Input', 'InputNumber'];

export const groupComponents = ['Select', 'RadioGroup', 'CheckboxGroup'];

export const dateComponents = ['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker', 'RangePicker'];

type CheckComponents = 'Option' | 'Checkbox' | 'CheckboxButton' | 'Radio' | 'RadioButton';
export const getGroupOption = (schema: FormSchema): CheckComponents | undefined => {
  let ret: CheckComponents | undefined  = undefined;
  switch (schema.component) {
    case 'RadioGroup':
      ret = schema.componentProps.optionType === 'button' ? 'RadioButton' : 'Radio';
      break;
    case 'CheckboxGroup':
      ret = schema.componentProps.optionType === 'button' ? 'CheckboxButton' : 'Checkbox';
      break;
    case 'Select':
      ret = 'Option';
      break;

  }
  return ret;
}

export function isIncludeSimpleComponents(component?: ComponentType) {
  return simpleComponents.includes(component || '');
}

export function handleInputNumberValue(component?: ComponentType, val?: any) {
  if (!component) return val;
  if (defaultValueComponents.includes(component)) {
    return val && isNumber(val) ? `${val}` : val;
  }
  return val;
}

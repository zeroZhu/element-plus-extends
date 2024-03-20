import type { Component, VNodeProps } from 'vue';
export type ComponentType = keyof ComponentProps;

type MethodsNameToCamelCase<
  T extends string,
  M extends string = '',
> = T extends `${infer F}-${infer N}${infer Tail}`
  ? MethodsNameToCamelCase<Tail, `${M}${F}${Uppercase<N>}`>
  : `${M}${T}`;

type MethodsNameTransform<T> = {
  [K in keyof T as K extends `on${string}` ? MethodsNameToCamelCase<K> : never]: T[K];
};

interface _CustomComponents {
  Text: ExtractPropTypes<(typeof import('../components/Text.vue'))['default']>;
};

type CustomComponents<T = _CustomComponents> = {
  [K in keyof T]: T[K] & MethodsNameTransform<T[K]>;
};

type OptionsItem = {
  label: string | number | boolean;
  value: string | number | boolean;
  disabled?: boolean;
}
type SelectOptions = OptionsItem[]
type RadioGroupOptions = string[] | number[] | Array<OptionsItem>;
type CheckboxGroupOptions = string[] | Array<OptionsItem & { indeterminate?: boolean; onChange?: Function }>

export interface ComponentProps {
  Input: ExtractPropTypes<(typeof import('element-plus/es/components/input'))['default']>;
  InputNumber: ExtractPropTypes<(typeof import('element-plus/es/components/input-number'))['default']>;
  Select: ExtractPropTypes<(typeof import('element-plus/es/components/select'))['default']> &
    { options: SelectOptions };
  VirtualSelect: ExtractPropTypes<(typeof import('element-plus/es/components/select-v2'))['default']>;
  // ApiSelect: CustomComponents['ApiSelect'] & ComponentProps['Select'];
  TreeSelect: ExtractPropTypes<(typeof import('element-plus/es/components/tree-select'))['default']>;
  Radio: ExtractPropTypes<(typeof import('element-plus/es/components/radio'))['default']> ;
  RadioGroup: ExtractPropTypes<(typeof import('element-plus/es/components/radio'))['ElRadioGroup']> &
    { options: RadioGroupOptions; optionType?: 'default' | 'button' };
  RadioButton: ExtractPropTypes<(typeof import('element-plus/es/components/radio'))['ElRadioButton']>;
  Checkbox: ExtractPropTypes<(typeof import('element-plus/es/components/checkbox'))['default']>;
  CheckboxGroup: ExtractPropTypes<(typeof import('element-plus/es/components/checkbox'))['ElCheckboxGroup']> & 
    { options: CheckboxGroupOptions; optionType?: 'default' | 'button' };
  CheckboxButton: ExtractPropTypes<(typeof import('element-plus/es/components/checkbox'))['ElCheckboxButton']>;
  Switch: ExtractPropTypes<(typeof import('element-plus/es/components/switch'))['default']>;
  // ApiTree: CustomComponents['ApiTree'] &
  //   ExtractPropTypes<(typeof import('ant-design-vue/es/tree'))['default']>;
  // ApiTreeSelect: CustomComponents['ApiTreeSelect'] & ComponentProps['TreeSelect'];
  // ApiRadioGroup: CustomComponents['ApiRadioGroup'] & ComponentProps['RadioGroup'];
  // RadioButtonGroup: CustomComponents['RadioButtonGroup'] & ComponentProps['RadioGroup'];
  // CheckboxGroup: ExtractPropTypes<(typeof import('ant-design-vue/es/checkbox'))['CheckboxGroup']>;
  // AutoComplete: ExtractPropTypes<(typeof import('ant-design-vue/es/auto-complete'))['default']>;
  Cascader: ExtractPropTypes<(typeof import('element-plus/es/components/cascader'))['default']>;
  Calendar: ExtractPropTypes<(typeof import('element-plus/es/components/calendar'))['default']>;
  DatePicker: ExtractPropTypes<(typeof import('element-plus/es/components/date-picker'))['default']>;
  TimePicker: ExtractPropTypes<(typeof import('element-plus/es/components/time-picker'))['default']>;
  // RangePicker: ExtractPropTypes<(typeof import('ant-design-vue/es/date-picker'))['RangePicker']>;
  // WeekPicker: ExtractPropTypes<(typeof import('ant-design-vue/es/date-picker'))['WeekPicker']>;
  // TimePicker: ExtractPropTypes<(typeof import('ant-design-vue/es/time-picker'))['TimePicker']>;
  // TimeRangePicker: ExtractPropTypes<
  //   (typeof import('ant-design-vue/es/time-picker'))['TimeRangePicker']
  // >;
  
  // StrengthMeter: CustomComponents['StrengthMeter'] & ComponentProps['InputPassword'];
  // Upload: CustomComponents['Upload'];
  // ImageUpload: CustomComponents['ImageUpload'];
  // IconPicker: CustomComponents['IconPicker'];
  // Render: Record<string, any>;
  
  Rate: ExtractPropTypes<(typeof import('element-plus/es/components/rate'))['default']>;
  Slider: ExtractPropTypes<(typeof import('element-plus/es/components/slider'))['default']>;
  // Divider: ExtractPropTypes<(typeof import('ant-design-vue/es/divider'))['default']>;
  // ApiTransfer: CustomComponents['ApiTransfer'] & ComponentProps['Transfer'];
  // Transfer: ExtractPropTypes<(typeof import('ant-design-vue/es/transfer'))['default']>;
  // CropperAvatar: CustomComponents['CropperAvatar'];
  // BasicTitle: CustomComponents['BasicTitle'];
  Text: CustomComponents['Text'];
}
  

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

type ExtractPropTypes<T extends Component> = T extends new (...args: any) => any
  ? Omit<InstanceType<T>['$props'], keyof VNodeProps>
  : never;

interface _CustomComponents {};

type CustomComponents<T = _CustomComponents> = {
  [K in keyof T]: T[K] & MethodsNameTransform<T[K]>;
};

export interface ComponentProps {
  Input: ExtractPropTypes<(typeof import('element-plus/es/components/input'))['default']>;
  InputGroup: ExtractPropTypes<(typeof import('element-plus/es/components/input'))['InputGroup']>;
  InputPassword: ExtractPropTypes<(typeof import('element-plus/es/components/input'))['InputPassword']>;
  InputSearch: ExtractPropTypes<(typeof import('element-plus/es/components/input'))['InputSearch']>;
  InputTextArea: ExtractPropTypes<(typeof import('element-plus/es/components/input'))['Textarea']>;
  // InputNumber: ExtractPropTypes<(typeof import('ant-design-vue/es/input-number'))['default']>;
  // InputCountDown: CustomComponents['InputCountDown'] & ComponentProps['Input'];
  // Select: ExtractPropTypes<(typeof import('ant-design-vue/es/select'))['default']>;
  // ApiSelect: CustomComponents['ApiSelect'] & ComponentProps['Select'];
  // TreeSelect: ExtractPropTypes<(typeof import('ant-design-vue/es/tree-select'))['default']>;
  // ApiTree: CustomComponents['ApiTree'] &
  //   ExtractPropTypes<(typeof import('ant-design-vue/es/tree'))['default']>;
  // ApiTreeSelect: CustomComponents['ApiTreeSelect'] & ComponentProps['TreeSelect'];
  // ApiRadioGroup: CustomComponents['ApiRadioGroup'] & ComponentProps['RadioGroup'];
  // RadioButtonGroup: CustomComponents['RadioButtonGroup'] & ComponentProps['RadioGroup'];
  // RadioGroup: ExtractPropTypes<(typeof import('ant-design-vue/es/radio'))['RadioGroup']>;
  // Checkbox: ExtractPropTypes<(typeof import('ant-design-vue/es/checkbox'))['default']>;
  // CheckboxGroup: ExtractPropTypes<(typeof import('ant-design-vue/es/checkbox'))['CheckboxGroup']>;
  // AutoComplete: ExtractPropTypes<(typeof import('ant-design-vue/es/auto-complete'))['default']>;
  // ApiCascader: CustomComponents['ApiCascader'] & ComponentProps['Cascader'];
  // Cascader: ExtractPropTypes<(typeof import('ant-design-vue/es/cascader'))['default']>;
  // DatePicker: ExtractPropTypes<(typeof import('ant-design-vue/es/date-picker'))['default']>;
  // MonthPicker: ExtractPropTypes<(typeof import('ant-design-vue/es/date-picker'))['MonthPicker']>;
  // RangePicker: ExtractPropTypes<(typeof import('ant-design-vue/es/date-picker'))['RangePicker']>;
  // WeekPicker: ExtractPropTypes<(typeof import('ant-design-vue/es/date-picker'))['WeekPicker']>;
  // TimePicker: ExtractPropTypes<(typeof import('ant-design-vue/es/time-picker'))['TimePicker']>;
  // TimeRangePicker: ExtractPropTypes<
  //   (typeof import('ant-design-vue/es/time-picker'))['TimeRangePicker']
  // >;
  // Switch: ExtractPropTypes<(typeof import('ant-design-vue/es/switch'))['default']>;
  // StrengthMeter: CustomComponents['StrengthMeter'] & ComponentProps['InputPassword'];
  // Upload: CustomComponents['Upload'];
  // ImageUpload: CustomComponents['ImageUpload'];
  // IconPicker: CustomComponents['IconPicker'];
  // Render: Record<string, any>;
  // Slider: ExtractPropTypes<(typeof import('ant-design-vue/es/slider'))['default']>;
  // Rate: ExtractPropTypes<(typeof import('ant-design-vue/es/rate'))['default']>;
  // Divider: ExtractPropTypes<(typeof import('ant-design-vue/es/divider'))['default']>;
  // ApiTransfer: CustomComponents['ApiTransfer'] & ComponentProps['Transfer'];
  // Transfer: ExtractPropTypes<(typeof import('ant-design-vue/es/transfer'))['default']>;
  // CropperAvatar: CustomComponents['CropperAvatar'];
  // BasicTitle: CustomComponents['BasicTitle'];
}
  

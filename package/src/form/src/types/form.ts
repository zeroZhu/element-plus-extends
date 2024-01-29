import type { VNode, CSSProperties } from "vue";
import type { RowProps as ElRowProps } from "element-plus/lib/components/row";
import type { ColProps as ElColProps } from "element-plus/lib/components/col";
import type { FormItemRule } from "element-plus/lib/components/form";
import type { FormItem } from "./formItem";
import type { ComponentType, ComponentProps } from "./index";

export type FieldMapToTime = [
  string,
  [string, string],
  (string | [string, string])?
][];
export type Rule = FormItemRule & {
  trigger?: "blur" | "change" | ["change", "blur"];
};
export interface RenderCallbackParams {
  schema: FormSchemaInner;
  values: Recordable;
  model: Recordable;
  field: string;
}

export type FormLayout = "vertical" | "inline" | "horizontal";
export type FormSize = "" | "default" | "small" | "large";
export type RenderOpts = {
  disabled: boolean;
  [key: string]: any;
};

export interface FormActionType {
  submit: () => Promise<void>;
  setFieldsValue: (values: Recordable) => Promise<void>;
  resetFields: () => Promise<void>;
  getFieldsValue: () => Recordable;
  clearValidate: (name?: string | string[]) => Promise<void>;
  updateSchema: (
    data: Partial<FormSchemaInner> | Partial<FormSchemaInner>[]
  ) => Promise<void>;
  resetSchema: (
    data: Partial<FormSchemaInner> | Partial<FormSchemaInner>[]
  ) => Promise<void>;
  setProps: (formProps: Partial<FormProps>) => Promise<void>;
  removeSchemaByField: (field: string | string[]) => Promise<void>;
  appendSchemaByField: (
    schema: FormSchemaInner | FormSchemaInner[],
    prefixField: string | undefined,
    first?: boolean | undefined
  ) => Promise<void>;
  validateFields: (nameList?: string[]) => Promise<any>;
  validate: <T = Recordable>(nameList?: string[] | false) => Promise<T>;
  scrollToField: (name: string, options?: ScrollOptions) => Promise<void>;
}

export interface FormProps {
  name?: string;
  layout?: FormLayout;
  // Form value
  model?: Recordable;
  // The width of all items in the entire form
  labelWidth?: number | string;
  // alignment
  labelAlign?: "left" | "right";
  // Row configuration for the entire form
  rowProps?: ElRowProps;
  // Submit form on reset
  submitOnReset?: boolean;
  // Submit form on form changing
  submitOnChange?: boolean;
  // Col configuration for the entire form
  labelCol?: Partial<ElColProps>;
  // Col configuration for the entire form
  wrapperCol?: Partial<ElColProps>;

  // General row style
  baseRowStyle?: CSSProperties;

  // General col configuration
  baseColProps?: Partial<ElColProps>;

  // Form configuration rules
  schemas?: FormSchema[];
  // Function values used to merge into dynamic control form items
  mergeDynamicData?: Recordable;
  // Compact mode for search forms
  compact?: boolean;
  // Blank line span
  emptySpan?: number | Partial<ElColProps>;
  // Internal component size of the form
  size?: FormSize;
  // Whether to disable
  disabled?: boolean;
  // Whether to readonly
  readonly?: boolean;
  // Time interval fields are mapped into multiple
  fieldMapToTime?: FieldMapToTime;
  // Placeholder is set automatically
  autoSetPlaceHolder?: boolean;
  // Auto submit on press enter on input
  autoSubmitOnEnter?: boolean;
  // Check whether the information is added to the label
  rulesMessageJoinLabel?: boolean;
  // Whether to show collapse and expand buttons
  showAdvancedButton?: boolean;
  // Whether to focus on the first input box, only works when the first form item is input
  autoFocusFirstItem?: boolean;
  // Automatically collapse over the specified number of rows
  autoAdvancedLine?: number;
  // Always show lines
  alwaysShowLines?: number;
  // Whether to show the operation button
  showActionButtonGroup?: boolean;

  // Reset button configuration
  resetButtonOptions?: Partial<SYButtonProps>;

  // Confirm button configuration
  submitButtonOptions?: Partial<SYButtonProps>;

  // Operation column configuration
  actionColOptions?: Partial<ElColProps>;

  // Show reset button
  showResetButton?: boolean;
  // Show confirmation button
  showSubmitButton?: boolean;

  tableAction: any;

  resetFunc?: () => Promise<void>;
  submitFunc?: () => Promise<void>;
  transformDateFunc?: (date: any) => string;
  colon?: boolean;
}

interface BaseFormSchema<T extends ComponentType = any> {
  // Field name
  field: string;
  // Extra Fields name[]
  fields?: string[];
  // Event name triggered by internal value change, default change
  changeEvent?: string;
  // Variable name bound to v-model Default value
  valueField?: string;
  // Label name
  label?: string | VNode;
  // Auxiliary text
  subLabel?: string;
  // Help text on the right side of the text
  helpMessage?:
    | string
    | string[]
    | ((renderCallbackParams: RenderCallbackParams) => string | string[]);
  // BaseHelp component props
  helpComponentProps?: Partial<HelpComponentProps>;
  // Label width, if it is passed, the labelCol and WrapperCol configured by itemProps will be invalid
  labelWidth?: string | number;
  // Disable the adjustment of labelWidth with global settings of formModel, and manually set labelCol and wrapperCol by yourself
  disabledLabelWidth?: boolean;
  // Component parameters
  componentProps?:
    | ((opt: {
        schema: FormSchema;
        tableAction: any;
        formActionType: FormActionType;
        formModel: Recordable;
      }) => ComponentProps[T])
    | ComponentProps[T];
  // Required
  required?:
    | boolean
    | ((renderCallbackParams: RenderCallbackParams) => boolean);

  suffix?:
    | string
    | number
    | ((values: RenderCallbackParams) => string | number);

  // Validation rules
  rules?: Rule[];
  // Check whether the information is added to the label
  rulesMessageJoinLabel?: boolean;

  // Reference formModelItem
  itemProps?: Partial<FormItem>;

  // col configuration outside formModelItem
  colProps?: Partial<ElColProps>;

  // 默认值
  defaultValue?: any;

  // 额外默认值数组对象
  defaultValueObj?: { [key: string]: any };

  // 是否自动处理与时间相关组件的默认值
  isHandleDateDefaultValue?: boolean;

  isAdvanced?: boolean;

  // Matching details components
  span?: number;

  ifShow?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  show?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  // Render the content in the form-item tag
  render?: (
    renderCallbackParams: RenderCallbackParams,
    opts: RenderOpts
  ) => VNode | VNode[] | string;

  // Rendering col content requires outer wrapper form-item
  renderColContent?: (
    renderCallbackParams: RenderCallbackParams,
    opts: RenderOpts
  ) => VNode | VNode[] | string;

  renderComponentContent?:
    | ((renderCallbackParams: RenderCallbackParams, opts: RenderOpts) => any)
    | VNode
    | VNode[]
    | string;

  // Custom slot, similar to renderColContent
  colSlot?: string;

  dynamicDisabled?:
    | boolean
    | ((renderCallbackParams: RenderCallbackParams) => boolean);

  dynamicReadonly?:
    | boolean
    | ((renderCallbackParams: RenderCallbackParams) => boolean);

  dynamicRules?: (renderCallbackParams: RenderCallbackParams) => Rule[];
}

export interface ComponentFormSchema<T extends ComponentType = any>
  extends BaseFormSchema<T> {
  // render component
  component: T;
}

export interface SlotFormSchema extends BaseFormSchema {
  // Custom slot, in form-item
  slot: string;
}

type ComponentFormSchemaType<T extends ComponentType = ComponentType> =
  T extends any ? ComponentFormSchema<T> : never;

export type FormSchema = ComponentFormSchemaType | SlotFormSchema;

export type FormSchemaInner = Partial<ComponentFormSchema> &
  Partial<SlotFormSchema> &
  BaseFormSchema;

export interface HelpComponentProps {
  maxWidth: string;
  // Whether to display the serial number
  showIndex: boolean;
  // Text list
  text: any;
  // colour
  color: string;
  // font size
  fontSize: string;
  icon: string;
  absolute: boolean;
  // Positioning
  position: any;
}

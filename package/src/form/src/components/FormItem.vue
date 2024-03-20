<script lang="tsx">
import { type PropType, type Ref, computed, defineComponent, toRefs, unref, ref, reactive } from "vue";
import type {
  FormActionType,
  FormProps,
  FormSchemaInner as FormSchema,
} from "../types/form";
import type { FormItemRule as ValidationRule } from "element-plus/lib/components/form";
import { getGroupOption, groupComponents, isIncludeSimpleComponents } from "../types/hooks";

import { useItemLabelWidth } from "../hooks/useLabelWidth";
import {
  NO_AUTO_LINK_COMPONENTS,
  createPlaceholderMessage,
  isComponentFormSchema,
  setComponentRuleType,
} from "../hooks/useForm";
import { cloneDeep, upperFirst } from "lodash-es";

import { getSlot } from "@/utils/tsx";
import { isBoolean, isFunction, isNull, isEmpty } from "@/utils/is";

import { ElCol, ElFormItem, ElDivider } from "element-plus";
import { componentMap } from "../componentMap";

export default defineComponent({
  name: "BasicFormItem",
  inheritAttrs: false,
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      default: () => ({}),
    },
    formProps: {
      type: Object as PropType<FormProps>,
      default: () => ({}),
    },
    allDefaultValues: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    formModel: {
      type: Object as PropType<Recordable<any>>,
      default: () => ({}),
    },
    tableAction: {
      type: Object as PropType<FormActionType>,
    },
    formAction: {
      type: Object as PropType<any>,
    },
    isAdvanced: {
      type: Boolean,
    },
    setFormModel: {
      type: Function as PropType<
        (key: string, value: any, schema: FormSchema) => void
      >,
      default: null,
    },
  },
  setup(props, { slots }) {
    const { schema, formProps } = toRefs(props) as {
      schema: Ref<FormSchema>;
      formProps: Ref<FormProps>;
    };

    const itemLabelWidthProp = useItemLabelWidth(schema, formProps);

    // 获所有传入values
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

    // 获取渲染组件props
    const getComponentsProps = computed(() => {
      const { schema, tableAction, formModel, formAction } = props;
      let { componentProps = {} } = schema;
      // componentProps 可以是props对象/返回props的函数
      if (isFunction(componentProps)) {
        componentProps =
          componentProps({ schema, tableAction, formModel, formAction }) ?? {};
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
      const joinLabel = Reflect.has(props.schema, "rulesMessageJoinLabel")
        ? rulesMessageJoinLabel
        : globalRulesMessageJoinLabel;
      // 初始化默认提示
      const assertLabel = joinLabel ? label : "";
      const defaultMsg = component
        ? createPlaceholderMessage(component) + assertLabel
        : assertLabel;

      function validator(rule: any, value: any) {
        const msg = rule.message || (defaultMsg as string);
        if (value === undefined || isNull(value)) {
            // 空值
            return Promise.reject(msg);
          } else if (Array.isArray(value) && value.length === 0) {
            // 数组类型
            return Promise.reject(msg);
          } else if (typeof value === 'string' && value.trim() === '') {
            // 空字符串
            return Promise.reject(msg);
          } else if (
            typeof value === 'object' &&
            Reflect.has(value, 'checked') &&
            Reflect.has(value, 'halfChecked') &&
            Array.isArray(value.checked) &&
            Array.isArray(value.halfChecked) &&
            value.checked.length === 0 &&
            value.halfChecked.length === 0
          ) {
            // 非关联选择的tree组件
            return Promise.reject(msg);
          }
          return Promise.resolve();
      }
      // 判定是否必须
      const getRequired = isFunction(required)
        ? required(unref(getValues))
        : required;

      /*
       * 1.设置了require，没有rules默认给一个rule
       * 2.设置了require，也有其他rules，以rule为优先
       * */
      if (getRequired) {
        if (isEmpty(rules)) {
          rules = [
            {
              required: getRequired,
              asyncValidator: validator,
              trigger: ["blur", "change"],
            },
          ];
        } else {
          const requiredIndex = rules.findIndex((rule) =>
            Reflect.has(rule, "required")
          );
          if (requiredIndex)
            rules.push({ required: true, asyncValidator: validator });
        }
      }

      // 寻找required的rule
      const requiredRuleIndex: number = rules.findIndex(
        (rule) =>
          Reflect.has(rule, "required") && !Reflect.has(rule, "validator")
      );

      if (requiredRuleIndex !== -1) {
        const rule = rules[requiredRuleIndex];
        const { isShow } = getShow();
        if (!isShow) {
          rule.required = false;
        }
        if (component) {
          rule.message = rule.message || (defaultMsg as string);

          if (component.includes("Input")) rule.whitespace = true;
          const valueFormat = unref(getComponentsProps)?.valueFormat;
          setComponentRuleType(rule, component, valueFormat);
        }
      }
      return rules;
    }

    function renderComponent() {
      if (!isComponentFormSchema(props.schema)) {
        return null;
      }
      const {
        renderComponentContent,
        component,
        field,
        label,
        placeholderJoinLabel,
        changeEvent = "update:model-value",
        valueField,
      } = props.schema;
      // 判断是否是选择类型
      const isCheck = component && ['Radio', 'Checkbox'].includes(component);
      // 判定是否是Select类型
      const isSelect = component && ['Select'].includes(component);

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
      
      // 获取组件类型
      const Comp = componentMap.get(component) as ReturnType<
        typeof defineComponent
      >;
      const { autoSetPlaceHolder, placeholderJoinLabel: globalPlaceholderJoinLabel, size } = props.formProps;
      const propsData: Recordable<any> = {
        allowClear: true,
        size,
        ...unref(getComponentsProps),
        disabled: unref(getDisable),
        readonly: unref(getReadonly),
      };

      // 判定placeholder
      const isCreatePlaceholder = !propsData.disabled && autoSetPlaceHolder;
      const joinLabel = Reflect.has(props.schema, "placeholderJoinLabel")
        ? placeholderJoinLabel
        : globalPlaceholderJoinLabel;
      // 初始化默认placeholder
      const assertLabel = joinLabel ? label : "";
      if (isCreatePlaceholder && component !== "RangePicker" && component) {
        propsData.placeholder =
          unref(getComponentsProps)?.placeholder ||
          createPlaceholderMessage(component) + assertLabel;
      }
      propsData.codeField = field;
      propsData.formValues = unref(getValues);

      const bindValue: Recordable<any> = {
        [valueField || (isCheck ? "checked" : 'model-value')]: props.formModel[field]
      };
      const compAttr: Recordable = {
        ...propsData,
        ...on,
        ...bindValue,
      };
      if (!renderComponentContent) {
        // 如果是有子组件类型的
        const isGroupComponent = groupComponents.includes(component);
        const childKey = getGroupOption(props.schema);
        if (isGroupComponent && childKey) {
          const CompChild = componentMap.get(childKey) as ReturnType<typeof defineComponent>;
          const { options } = props.schema.componentProps;
          return <Comp {...compAttr} >
            {options.map((item: JSX.IntrinsicAttributes) => {
              const { label, value, ...others } = item;
              if (childKey === 'Option') {
                return <CompChild label={label} value={value} {...others}>{ label }</CompChild>;
              } else {
                return <CompChild label={label} value={value} {...others}>{ label }</CompChild>;
              }
            })}
          </Comp>;
        } else {
          return <Comp {...compAttr} />;
        }
        
      }

      const compSlot = isFunction(renderComponentContent)
        ? {
            ...renderComponentContent(unref(getValues), {
              disabled: unref(getDisable),
              readonly: unref(getReadonly),
            }),
          }
        : {
            default: () => renderComponentContent,
          };

      return <Comp {...compAttr}>{compSlot}</Comp>;
    }

    // function renderLabelHelpMessage() {
    //   const { label, helpMessage, helpComponentProps, subLabel } = props.schema;
    //   const renderLabel = subLabel ? (
    //     <span>
    //       {label} <span class="text-secondary">{subLabel}</span>
    //     </span>
    //   ) : (
    //     label
    //   );
    //   const getHelpMessage = isFunction(helpMessage)
    //     ? helpMessage(unref(getValues))
    //     : helpMessage;
    //   if (!getHelpMessage || (Array.isArray(getHelpMessage) && getHelpMessage.length === 0)) {
    //     return renderLabel;
    //   }
    //   return (
    //     <span>
    //       {renderLabel}
    //       {/* <BasicHelp placement="top" class="mx-1" text={getHelpMessage} {...helpComponentProps} /> */}
    //     </span>
    //   );
    // }

    function renderItem() {
      const { itemProps, slot, render, label, field, suffix, component } =
        props.schema;
      const { labelWidth } = unref(itemLabelWidthProp);
      const { colon } = props.formProps;
      const opts = {
        disabled: unref(getDisable),
        readonly: unref(getReadonly),
      };
      let ItemComponent;
      switch (component) {
        case "Divider":
          {
            ItemComponent = (
              <ElCol span={24}>
                <ElDivider {...unref(getComponentsProps)}>{label}</ElDivider>
              </ElCol>
            );
          }
          break;
        default: {
          const getContent = () => {
            return slot
              ? getSlot(slots, slot, unref(getValues), opts)
              : render
              ? render(unref(getValues), opts)
              : renderComponent();
          };
          const showSuffix = !!suffix;
          const getSuffix = isFunction(suffix)
            ? suffix(unref(getValues))
            : suffix;

          // TODO 自定义组件验证会出现问题，因此这里框架默认将自定义组件设置手动触发验证，如果其他组件还有此问题请手动设置autoLink=false
          if (component && NO_AUTO_LINK_COMPONENTS.includes(component)) {
            props.schema &&
              (props.schema.itemProps! = {
                autoLink: false,
                ...props.schema.itemProps,
              });
          }
          ItemComponent = (
            <ElFormItem
              prop={field}
              colon={colon}
              class={showSuffix ? "suffix-item"+itemProps?.class : itemProps?.class}
              {...(itemProps as Recordable<any>)}
              // @ts-ignore
              label={label}
              rules={handleRules()}
              labelWidth={labelWidth}
            >
              <div class='flex items-center flex-auto'>{getContent()}</div>
              {showSuffix && <span class="suffix">{getSuffix}</span>}
            </ElFormItem>
          );
        }
      }
      return ItemComponent;
    }
    // TSX渲染
    return () => {
      const {
        colProps = {},
        colSlot,
        renderColContent,
        component,
        slot,
      } = props.schema;
      if (!((component && componentMap.has(component)) || slot)) return null;

      const { baseColProps = {} } = props.formProps;
      const realColProps = { ...baseColProps, ...colProps };
      const { isIfShow, isShow } = getShow();
      
      const opts = {
        disabled: unref(getDisable),
        readonly: unref(getReadonly),
      };

      // 渲染内容函数
      const getContent = () => {
        return colSlot
          ? getSlot(slots, colSlot, unref(getValues), opts)
          : renderColContent
          ? renderColContent(unref(getValues), opts)
          : renderItem();
      };
      return (
        isIfShow && (
          <ElCol {...realColProps} v-show={isShow}>
            {getContent()}
          </ElCol>
        )
      );
    };
  },
});
</script>

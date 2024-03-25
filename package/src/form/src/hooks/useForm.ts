import { ref, unref, nextTick, onUnmounted, watch } from "vue";
import type { ComponentType } from "../types";
import type {
  ComponentFormSchema,
  FormActionType,
  FormProps,
  FormSchemaInner as FormSchema,
  SlotFormSchema,
  UseFormReturnType,
} from "../types/form";
import type { FormItemRule as ValidationRule } from "element-plus/lib/components/form";
import { isProdMode } from "@package/utils/env";
import { getDynamicProps } from "@package/hooks/useHelper";
import { error } from "@package/utils/log";
import { FormItemProps } from "element-plus";

export function isSlotFormSchema(schema: FormSchema): schema is SlotFormSchema {
  return "slot" in schema;
}

export function isComponentFormSchema(
  schema: FormSchema
): schema is ComponentFormSchema {
  return !isSlotFormSchema(schema);
}

/**
 * @description: 生成placeholder
 */
export function createPlaceholderMessage(component: ComponentType) {
  if (component.includes("Input") || component.includes("Complete")) {
    return "请输入";
  }
  if (component.includes("Picker")) {
    return "请选择";
  }
  if (
    component.includes("Select") ||
    component.includes("Cascader") ||
    component.includes("Checkbox") ||
    component.includes("Radio") ||
    component.includes("Switch")
  ) {
    // return `请选择${label}`;
    return "请选择";
  }
  return "";
}

/**
 * @description: 根据组件类型设置校验类型
 */
export function setComponentRuleType(
  rule: ValidationRule,
  component: ComponentType,
  valueFormat: string
) {
  if (Reflect.has(rule, "type")) {
    return;
  }
  if (
    ["DatePicker", "MonthPicker", "WeekPicker", "TimePicker"].includes(
      component
    )
  ) {
    rule.type = valueFormat ? "string" : "object";
  } else if (
    ["RangePicker", "Upload", "CheckboxGroup", "TimePicker"].includes(component)
  ) {
    rule.type = "array";
  } else if (["InputNumber"].includes(component)) {
    rule.type = "number";
  }
}

// TODO 自定义组件封装会出现验证问题，因此这里目前改成手动触发验证
export const NO_AUTO_LINK_COMPONENTS: ComponentType[] = [];

type Props = Partial<DynamicProps<FormProps>>;

export function useForm(props?: Props): UseFormReturnType {
  const formRef = ref<Nullable<FormActionType>>(null);
  const loadedRef = ref<Nullable<boolean>>(null);

  async function getForm() {
    const form = unref(formRef);
    if (!form) {
      error(
        'The form instance has not been obtained, please make sure that the form has been rendered when performing the form operation!',
      );
    }
    await nextTick();
    return form as FormActionType;
  }

  // 注册函数
  function register(instance: FormActionType) {
    isProdMode() &&
      onUnmounted(() => {
        formRef.value = null;
        loadedRef.value = null;
      });
    if (unref(loadedRef) && isProdMode() && instance === unref(formRef)) return;

    formRef.value = instance;
    loadedRef.value = true;

    // 动态监听Props
    watch(
      () => props,
      () => {
        props && instance.setProps(getDynamicProps(props));
      },
      {
        immediate: true,
        deep: true,
      }
    );
  }
  // 暴露的方法
  const methods: FormActionType = {
    scrollToField: async (name: string | string[]) => {
      const form = await getForm();
      form.scrollToField(name);
    },

    setProps: async (formProps: Partial<FormProps>) => {
      const form = await getForm();
      form.setProps(formProps);
    },

    getFieldsValue: <T>() => {
      return unref(formRef)?.getFieldsValue() as T;
    },

    setFieldsValue: async <T extends Recordable<any>>(values: T) => {
      const form = await getForm();
      await form?.setFieldsValue(values);
    },

    resetFields: async () => {
      const form = await getForm();
      await form.resetFields();
    },

    updateSchema: async (
      data: Partial<FormSchema> | Partial<FormSchema>[]
    ) => {
      const form = await getForm();
      form.updateSchema(data);
    },

    resetSchema: async (
      data: Partial<FormSchema> | Partial<FormSchema>[]
    ) => {
      const form = await getForm();
      form.resetSchema(data);
    },

    clearValidate: async (name?: string | string[]) => {
      const form = await getForm();
      form.clearValidate(name);
    },

    removeSchemaByField: async (field: string | string[]) => {
      unref(formRef)?.removeSchemaByField(field);
    },

    appendSchemaByField: async (
      schema: FormSchema | FormSchema[],
      prefixField: string | undefined,
      first?: boolean
    ) => {
      const form = await getForm();
      form.appendSchemaByField(schema, prefixField, first);
    },

    submit: async (): Promise<void> => {
      const form = await getForm();
      return form.submit();
    },

    validate: async <T = Recordable>(): Promise<T> => {
      const form = await getForm();
      return form.validate();
    },

    validateField: async (nameList?: FormItemProps[]): Promise<any> => {
      const form = await getForm();
      return form.validateField(nameList);
    },
  };  
  return [register, methods];
}

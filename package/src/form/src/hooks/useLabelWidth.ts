import { type Ref, computed, unref } from "vue";
import type { FormProps, FormSchemaInner as FormSchema } from "../types/form";
import { isNumber } from "lodash-es";

export function useItemLabelWidth(schemaItemRef: Ref<FormSchema> | FormSchema, propsRef: Ref<FormProps> | FormProps) {
  return computed(() => {
    const schemaItem = unref(schemaItemRef);
    const { labelWidth, disabledLabelWidth } = schemaItem || {};

    const { labelWidth: globalLabelWidth, } = unref(propsRef);

    // 如果设置了全局labelWidth 所有item都同步设置
    if ((!globalLabelWidth && !labelWidth) || disabledLabelWidth) {
      return { labelWidth: 'auto' };
    }
    let width = labelWidth || globalLabelWidth;

    return { labelWidth: width }
  })
}

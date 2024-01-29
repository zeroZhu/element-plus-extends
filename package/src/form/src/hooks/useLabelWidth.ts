import { type Ref, computed, unref } from "vue";
import type { FormProps, FormSchemaInner as FormSchema } from "../types/form";
import { isNumber } from "lodash-es";

export function useItemLabelWidth(schemaItemRef: Ref<FormSchema> | FormSchema, propsRef: Ref<FormProps> | FormProps) {
  return computed(() => {
    const schemaItem = unref(schemaItemRef);
    const { labelWidth, disabledLabelWidth, itemProps } = schemaItem || {};
    const { labelCol = {}, wrapperCol = {} } =itemProps || {};

    const {
      labelWidth: globalLabelWidth,
      labelCol: globalLabelCol,
      wrapperCol: globWrapperCol,
      layout,
    } = unref(propsRef);

    // 如果设置了全局labelWidth 所有item都同步设置
    if ((!globalLabelWidth && !labelWidth && !globalLabelCol) || disabledLabelWidth) {
      // @ts-ignore
      labelCol.style = { textAlign: 'left' };
      return { labelCol, wrapperCol };
    }
    let width = labelWidth || globalLabelWidth;
    const col = { ...globalLabelCol, ...labelCol };
    const warpCol = { ...globWrapperCol, ...wrapperCol };

    if (width) {
      width = isNumber(width) ? `${width}px` : width;
    }

    return{
      labelCol: { style: {width }, ...col },
      wrapperCol: {
        style: { width: layout === 'vertical' ? '100%' : `calc(100% - ${width})` },
        ...warpCol
      }
    }
  })
}

import { type Ref, type ComputedRef, unref } from 'vue';
import type { FormProps, FormSchemaInner as FormSchema } from '../types/form';
import { isArray, isFunction, isEmpty, isObject, isString, isNil, cloneDeep, get, set, unset } from 'lodash-es';
import { dateUtil } from '@package/utils/date';

interface UseFormValuesContext {
  defaultValueRef: Ref<any>;
  getSchema: ComputedRef<FormSchema[]>;
  getProps: ComputedRef<FormProps>;
  formModel: Recordable;
}

/**
 * @param key 键
 * @param value 值
 * @param target 目标对象
 * @description 结构数组链接健
 */
function tryDeconstructArray(key: string, value: any, target: Recordable) {
  const pattern = /^\[(.+)\]$/;
  if (pattern.test(key)) {
    const match = key.match(pattern);
    if (match && match[1]) {
      const keys = match[1].split(',');
      value = isArray(value) ? value : [value];
      keys.forEach((k, index) => {
        set(target, k.trim(), value[index]);
      });
      return true;
    }
  }
}

/**
 * @param key 键
 * @param value 值
 * @param target 目标对象
 * @description 解构对象链接健
 */
function tryDeconstructObject(key: string, value: any, target: Recordable) {
  const pattern = /^\[(.+)\]$/;
  if (pattern.test(key)) {
    const match = key.match(pattern);
    if (match && match[1]) {
      const keys = match[1].split(',');
      value = isObject(value) ? value : [value];
      keys.forEach((k, index) => {
        set(target, k.trim(), value[index]);
      });
      return true;
    }
  }
}



export function useFormValues({
  defaultValueRef,
  getSchema,
  formModel,
  getProps,
}: UseFormValuesContext) {
  // 格式化时间
  function formatTime(time: string, format: string) {
    if (format === 'timestamp') {
      return dateUtil(time).unix();
    } else if (format === 'timestampStartDay') {
      return dateUtil(time).startOf('day').unix();
    }
    return dateUtil(time).format(format);
  }

  // 格式化时间段
  function handleRangeTimeValue(values: Recordable) {
    const fieldMapToTime = unref(getProps).fieldMapToTime;

    if (!fieldMapToTime || !Array.isArray(fieldMapToTime)) {
      return values;
    }

    for (const [field, [startTimeKey, endTimeKey], format = 'YYYY-MM-DD'] of fieldMapToTime) {
      if (!field || !startTimeKey || !endTimeKey) {
        continue;
      }
      // If the value to be converted is empty, remove the field
      if (!get(values, field)) {
        unset(values, field);
        continue;
      }

      const [startTime, endTime]: string[] = get(values, field);

      const [startTimeFormat, endTimeFormat] = Array.isArray(format) ? format : [format, format];

      if (!isNil(startTime) && !isEmpty(startTime)) {
        set(values, startTimeKey, formatTime(startTime, startTimeFormat));
      }
      if (!isNil(endTime) && !isEmpty(endTime)) {
        set(values, endTimeKey, formatTime(endTime, endTimeFormat));
      }
      unset(values, field);
    }

    return values;
  }

  function handleFormValues(values: Recordable) {
    if (!isObject(values)) return {};
    const res = Object.create(null);
    for (const item of Object.entries(values)) {
      let [key, value] = item;
      if (!key || (isArray(value) && value.length === 0) || isFunction(value)) {
        continue;
      }

      const transformDateFunc = unref(getProps).transformDateFunc;
      if (isObject(value)) {
        value = (value as Recordable).map((item: any) => transformDateFunc?.(item))
      }

      if (isString(value)) {
        value = value.trim();
      }

      if (!tryDeconstructArray(key, value, res) && !tryDeconstructObject(key, value, res)) {
        set(res, key, value)
      }
    }
    return handleRangeTimeValue(res);
  }

  function initDefault() {
    const schemas = unref(getSchema);
    const res: Recordable = {};
    schemas.forEach((item) => {
      const { defaultValue, defaultValueObj } = item;
      const fieldKeys = Object.keys(defaultValueObj || {});
      if (fieldKeys.length) {
        fieldKeys.map(field => {
          res[field] = defaultValueObj![field]
        })
      }

      if (!isNil(defaultValue)) {
        res[item.field] = defaultValue;
        if (formModel[item.field] === undefined) {
          formModel[item.field] = defaultValue;
        }
      }
    });
    defaultValueRef.value = cloneDeep(res);
  }

  return { handleFormValues, initDefault };
}


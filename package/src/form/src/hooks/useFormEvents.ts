import { toRaw, unref, type ComputedRef, type Ref, nextTick } from 'vue';
import type { FormActionType, FormProps, FormSchemaInner as FormSchema } from '../types/form';
import type { FormItemProp } from 'element-plus';
import { dateComponents, handleInputNumberValue, isIncludeSimpleComponents } from '../types/hooks';
import { cloneDeep, set, uniqBy, get, isArray, isUndefined, isObject, isFunction, isString, isNil } from 'lodash-es';
import { dateUtil } from '@package/utils/date';
import { deepMerge } from '@package/utils';
import { error } from '@package/utils/log';

interface UseFormActionContext {
  emit: EmitType;
  getProps: ComputedRef<FormProps>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  defaultValueRef: Ref<Recordable>;
  formElRef: Ref<FormActionType>;
  schemaRef: Ref<FormSchema[]>;
  handleFormValues: Fn;
}

function tryConstructArray(field: string, values: Recordable = {}): any[] | undefined {
  const pattern = /^\[(.+)\]$/;
  if (pattern.test(field)) {
    const match = field.match(pattern);
    if (match && match[1]) {
      const keys = match[1].split(',');
      if (!keys.length) {
        return undefined;
      }
      const result: any[] = [];
      keys.forEach((k, index) => {
        set(result, index, values[k.trim()]);
      });
      return result.filter(Boolean).length ? result : undefined;
    }
  }
}

function tryConstructObject(field: string, values: Recordable = {}): Recordable | undefined {
  const pattern = /^\[(.+)\]$/;
  if (pattern.test(field)) {
    const match = field.match(pattern);
    if (match && match[1]) {
      const keys = match[1].split(',');
      if (!keys.length) {
        return;
      }
      const result = {};
      keys.forEach((k) => {
        set(result, k.trim(), values[k.trim()]);
      });
      return Object.values(result).filter(Boolean).length ? result : undefined;
    }
  }
}

// 判断是否是 input
function checkIsInput(schema?: FormSchema) {
  return schema?.component === 'Input';
}

// 判断是否是 range slider
function checkIsRangeSlider(schema: FormSchema) {
  return schema.component === 'Slider' && schema.componentProps && 'range' in schema.componentProps
}

// 获取默认值
function getDefaultValue(
  schema: FormSchema | undefined,
  defaultValueRef: UseFormActionContext['defaultValueRef'],
  key: string,
) {
  let defaultValue = cloneDeep(defaultValueRef.value[key]);
  if (checkIsInput(schema)) return defaultValue || undefined;

  if (!defaultValue && schema) {
    // 判断是否是rangeSlider
    if (checkIsRangeSlider(schema)) defaultValue = [0, 0];
    // 判断是否是ApiTree
    if (schema.component === 'ApiTree') defaultValue = [];
  }
  return defaultValue;
}

export function useFormEvents({
  emit,
  getProps,
  formModel,
  getSchema,
  defaultValueRef,
  formElRef,
  schemaRef,
  handleFormValues,
}: UseFormActionContext) {

  const itemIsDateType = (key: string): boolean => {
    return unref(getSchema).some(item => {
      return item.field === key && item.component ? dateComponents.includes(item.component) : false;
    })
  }
  /**
   * @description: 重置表单
   */
  async function resetFields(): Promise<void> {
    const { resetFunc, submitOnReset } = unref(getProps);
    resetFunc && isFunction(resetFunc) && (await resetFunc());

    const formEl = unref(formElRef);
    if (!formEl) return;

    Object.keys(formModel).forEach((key) => {
      const schema = unref(getSchema).find((item) => item.field === key);
      const defaultValueObj = schema?.defaultValueObj;
      const fieldKeys = Object.keys(defaultValueObj || {});
      if (fieldKeys.length) {
        fieldKeys.map((field) => {
          formModel[field] = defaultValueObj![field];
        });
      }
      formModel[key] = getDefaultValue(schema, defaultValueRef, key);
    });
    nextTick(() => clearValidate());

    emit('reset', toRaw(formModel));
    submitOnReset && handleSubmit();
  }

  /**
   * @description: 获取表单fields
   */
  const getAllFields = () => unref(getSchema)
    .map((item) => [...(item.fields || []), item.field])
    .flat(1)
    .filter(Boolean);

  /**
   * @description: 重置Schema
   */
  async function resetSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
    let updateData: Partial<FormSchema>[] = [];
    if (isObject(data)) {
      updateData.push(data as FormSchema);
    }
    if (isArray(data)) {
      updateData = [...data];
    }

    const hasField = updateData.every(
      (item) =>
        isIncludeSimpleComponents(item.component) || (Reflect.has(item, 'field') && item.field),
    );

    if (!hasField) {
      error(
        'All children of the form Schema array that need to be updated must contain the `field` field',
      );
      return;
    }
    schemaRef.value = updateData as FormSchema[];
  }

  /**
   * @description: 更新Schema
   */
  async function updateSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
    let updateData: Partial<FormSchema>[] = [];
    if (isObject(data)) {
      updateData.push(data as FormSchema);
    }
    if (isArray(data)) {
      updateData = [...data];
    }

    const hasField = updateData.every(
      (item) =>
        isIncludeSimpleComponents(item.component) || (Reflect.has(item, 'field') && item.field),
    );

    if (!hasField) {
      error(
        'All children of the form Schema array that need to be updated must contain the `field` field',
      );
      return;
    }
    const schema: FormSchema[] = [];
    const updatedSchema: FormSchema[] = [];
    unref(getSchema).forEach((val) => {
      const updatedItem = updateData.find((item) => val.field === item.field);

      if (updatedItem) {
        const newSchema = deepMerge(val, updatedItem);
        updatedSchema.push(newSchema as FormSchema);
        schema.push(newSchema as FormSchema);
      } else {
        schema.push(val);
      }
    });
    _setDefaultValue(updatedSchema);

    schemaRef.value = uniqBy(schema, 'field');
  }

  /**
   * @description: 删除Schema
   */
  const removeSchemaByField = async (fields: string | string[]): Promise<void> => {
    const schemaList: FormSchema[] = cloneDeep(unref(getSchema));
    if (!fields || !fields.length) return;

    const fieldList: string[] = isString(fields) ? [fields] : fields;
    for (const field of fieldList) {
      _removeSchemaByFeild(field, schemaList);
    }
    schemaRef.value = schemaList;
  }
  /**
   * @description: 单个field删除
   */
  const _removeSchemaByFeild = (field: string, schemaList: FormSchema[]): void => {
    if (isString(field)) {
      const index = schemaList.findIndex((schema) => schema.field === field);
      if (index !== -1) {
        delete formModel[field];
        schemaList.splice(index, 1);
      }
    }
  }

  const appendSchemaByField = async (schemas: FormSchema | FormSchema[], prefixField?: string, first = false) => {
    const schemaList: FormSchema[] = cloneDeep(unref(getSchema));
    const addSchemaIds: string[] = isArray(schemas) ? schemas.map(item => item.field) : [schemas.field];
    // 判定field是否重复
    if (schemaList.some(item => addSchemaIds.includes(item.field))) {
      error('There are schemas that have already been added');
      return;
    }
    // 寻找插入定位
    const index = schemaList.findIndex((schema) => schema.field === prefixField);
    const _schemaList = isObject(schemas) ? [schemas as FormSchema] : (schemas as FormSchema[]);
    if (!prefixField || index === -1 || first) {
      first ? schemaList.unshift(..._schemaList) : schemaList.push(..._schemaList);
    } else if (index !== -1) {
      schemaList.splice(index + 1, 0, ..._schemaList);
    }

    schemaRef.value = schemaList;
    _setDefaultValue(schemas);
  }
  /**
   * @description: 设置默认值
   */
  function _setDefaultValue(data: FormSchema | FormSchema[]) {
    let schemas: FormSchema[] = [];
    if (isObject(data)) {
      schemas.push(data as FormSchema);
    }
    if (isArray(data)) {
      schemas = [...data];
    }

    const obj: Recordable = {};
    const currentFieldsValue = getFieldsValue();
    schemas.forEach((item) => {
      if (
        !isIncludeSimpleComponents(item.component) &&
        Reflect.has(item, 'field') &&
        item.field &&
        !isNil(item.defaultValue) &&
        (!(item.field in currentFieldsValue) || isNil(currentFieldsValue[item.field]))
      ) {
        obj[item.field] = item.defaultValue;
      }
    });
    setFieldsValue(obj);
  }

  /**
   * @description: 设置属性值
   */
  const setProps = async (formProps: Partial<FormProps>): Promise<void> => {
    await unref(formElRef)?.setProps(formProps);
  }

  /**
   * @description: 获取表单值
   */
  const getFieldsValue = (): Recordable => {
    const formEl = unref(formElRef);
    console.log('formEl====', formEl);
    return formEl ? handleFormValues(toRaw(unref(formModel))) : {};
  }
  /**
   * @description: 设置表单值
   */
  const setFieldsValue = async (values: Recordable): Promise<void> => {
    if (Object.keys(values).length === 0) return;
    const fields = getAllFields();
    console.log('fields===', fields)
    // key 支持 a.b.c 的嵌套写法 获取多层键值
    const nestKeyArray = fields.filter((item) => String(item).indexOf('.') >= 0)
    const validKeys: string[] = [];
    fields.forEach((key) => {
      const schema = unref(getSchema).find(item => item.field === key);
      const hasKey = Reflect.has(values, key);
      let value = get(values, key);
      value = handleInputNumberValue(schema?.component, value);

      const { componentProps } = schema || {};
      let _props = componentProps as any;
      if (isFunction(_props)) {
        _props = _props({ formModel: unref(formModel), formActionType });
      }

      const constructValue = tryConstructArray(key, values) || tryConstructObject(key, values);
      console.log('key===', constructValue)
      if (hasKey || !!constructValue) {
        const fieldValue = constructValue || value;
        // time type
        if (itemIsDateType(key)) {
          if (isArray(fieldValue)) {
            const arr: any[] = [];
            for (const ele of fieldValue) {
              arr.push(ele ? dateUtil(ele) : null);
            }
            unref(formModel)[key] = arr;
          } else {
            unref(formModel)[key] = fieldValue ? (_props?.valueFormat ? fieldValue : dateUtil(fieldValue)) : null;
          }
        } else {
          unref(formModel)[key] = fieldValue;
        }
        validKeys.push(key);
      } else {
        nestKeyArray.forEach((nestKey: string) => {
          try {
            const value = nestKey.split('.').reduce((out, item) => out[item], values);
            if (!isUndefined(value)) {
              unref(formModel)[nestKey] = unref(value);
              validKeys.push(nestKey);
            }
          } catch (error) {
            if (!isUndefined(defaultValueRef.value[nestKey])) {
              unref(formModel)[nestKey] = cloneDeep(unref(defaultValueRef.value[nestKey]));
            }
          }
        })
      }
    });
    console.log('validKeys===', validKeys)
    validateField(validKeys).catch((_) => {});
  }

  const validate = async () => {
    const formEl = unref(formElRef);
    const valid = await formEl?.validate();
    return valid ? handleFormValues(toRaw(unref(formModel))) : {};
  }

  const validateField = async (nameList?: FormItemProp[]) => {
    const values = await unref(formElRef)?.validateField(nameList);
    return handleFormValues(values);
  }

  const clearValidate = async (nameList?: string | string[]) => {
    await unref(formElRef)?.clearValidate(nameList);
  }

  const scrollToField = async (name: string | string[]) => {
    await unref(formElRef)?.scrollToField(name);
  }

  // 
  const handleSubmit = async (e?: Event): Promise<void> => {
    e && e.preventDefault();
    const { submitFunc } = unref(getProps);
    if (submitFunc && isFunction(submitFunc)) {
      return await submitFunc()
    }
    if (unref(formElRef)) {
      try {
        const values = await validate();
        emit('submit', values);
      } catch (error: any) {
        throw new Error(error);
      }
    }
  }
  const formActionType: Partial<FormActionType> = {
    getFieldsValue,
    setFieldsValue,
    resetFields,
    updateSchema,
    resetSchema,
    setProps,
    removeSchemaByField,
    appendSchemaByField,
    clearValidate,
    validateField,
    validate,
    submit: handleSubmit,
    scrollToField,
  };

  return {
    handleSubmit,
    clearValidate,
    validate,
    validateField,
    getFieldsValue,
    updateSchema,
    resetSchema,
    appendSchemaByField,
    removeSchemaByField,
    resetFields,
    setFieldsValue,
    scrollToField,
  };
}



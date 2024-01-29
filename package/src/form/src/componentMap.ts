import type { Component } from 'vue';
import type { ComponentType } from './types/index';
import {
  ElInput,
  ElInputNumber,
  ElAutocomplete,
  ElCalendar,
  ElSelect,
  ElSelectV2,
  ElCheckbox,
  ElCheckboxGroup,
  ElRadio,
  ElRadioGroup,
  ElDatePicker,
  ElTimePicker,
  ElTimeSelect,
  ElSlider,
  ElSwitch,
  ElColorPicker,
} from 'element-plus';


const componentMap = new Map<ComponentType | string, Component>();

componentMap.set('Input', ElInput);
componentMap.set('InputNumber', ElInputNumber);
componentMap.set('Autocomplete', ElAutocomplete);
componentMap.set('Calendar', ElCalendar);
componentMap.set('Select', ElSelect);
componentMap.set('SelectV2', ElSelectV2);
componentMap.set('Checkbox', ElCheckbox);
componentMap.set('CheckboxGroup', ElCheckboxGroup);
componentMap.set('Radio', ElRadio);
componentMap.set('RadioGroup', ElRadioGroup);
componentMap.set('DatePicker', ElDatePicker);
componentMap.set('TimePicker', ElTimePicker);
componentMap.set('TimeSelect', ElTimeSelect);
componentMap.set('Slider', ElSlider);
componentMap.set('Switch', ElSwitch);
componentMap.set('ColorPicker', ElColorPicker);



export function add<T extends string, R extends Component>(
  compName: ComponentType | T,
  component: R,
) {
  componentMap.set(compName, component);
}

export function del<T extends string>(compName: ComponentType | T) {
  componentMap.delete(compName);
}

export { componentMap };

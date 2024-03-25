import type { Slots } from 'vue';
import type { RenderOpts } from '@package/src/Form/src/types/form';
import { isFunction } from 'lodash-es';

/**
 * @description:  Get slot to prevent empty error
 */
export function getSlot(slots: Slots, slot = 'default', data?: any, opts?: RenderOpts) {
  if (!slots || !Reflect.has(slots, slot)) {
    return null;
  }
  if (!isFunction(slots[slot])) {
    console.error(`${slot} is not a function!`);
    return null;
  }
  const slotFn = slots[slot];
  if (!slotFn) return null;
  const params = { ...data, ...opts };
  return slotFn(params);
}

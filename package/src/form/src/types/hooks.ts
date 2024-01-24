import type { ComponentType } from './types';

export interface AdvanceState {
  isAdvanced: boolean;
  hideAdvanceBtn: boolean;
  isLoad: boolean;
  actionSpan: number;
}

export const simpleComponents = ['Divider', 'BasicTitle'];

export function isIncludeSimpleComponents(component?: ComponentType) {
  return simpleComponents.includes(component || '');
}
import type { FormLayout, FormSize } from './types/form';
export const basicProps = {
  model: () => ({}),
  // 标签宽度  固定宽度
  labelWidth: 0,
  fieldMapToTime: () => [],
  // 表单配置规则
  schemas: () => [],
  autoSetPlaceHolder: true,
  // 在INPUT组件上单击回车时，是否自动提交
  autoSubmitOnEnter: false,
  size: 'default' as FormSize,
  emptySpan: 0,
  // 转化时间
  transformDateFunc: (date: any) => {
    return date?.format?.('YYYY-MM-DD HH:mm:ss') ?? date;
  },
  rulesMessageJoinLabel: true,
  // 超过3行自动折叠
  autoAdvancedLine: 3,
  // 不受折叠影响的行数
  alwaysShowLines: 1,
  // 是否显示操作按钮
  showActionButtonGroup: true,
  // 显示重置按钮
  showResetButton: true,
  // 显示确认按钮
  showSubmitButton: true,
  // 以下为默认props
  layout: 'horizontal' as FormLayout,
};

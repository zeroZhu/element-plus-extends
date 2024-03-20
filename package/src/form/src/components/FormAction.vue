<template>
  <ElCol v-if="showActionButtonGroup">
    <div style="width: 100%;" :style="{ textAlign: actionColOpt.style?.textAlign }">
      <ElFormItem style="margin-bottom: 0;">
        <div class="flex justify-end w-full">
          <slot name="advanceBefore"></slot>
          <ElButton
            v-if="showAdvancedButton && !hideAdvanceBtn"
            size="small"
            link
            @click="toggleAdvanced"
          >
            {{ isAdvanced ? '收起' : '展开' }}
            <Icon v-show="isAdvanced" icon="ep:caret-top" />
            <Icon v-show="!isAdvanced" icon="ep:caret-bottom" />
          </ElButton>
          <slot name="advanceAfter"></slot>
          <slot name="resetBefore"></slot>
          <ElButton
            class="mr-2"
            v-bind="getResetBtnOptions"
            @click="resetAction"
            v-if="showResetButton"
          >
            {{ getResetBtnOptions.label }}
          </ElButton>
          <slot name="submitBefore"></slot>
          <ElButton
            class="mr-2"
            v-bind="getSubmitBtnOptions"
            @click="submitAction"
            v-if="showSubmitButton"
          >
            {{ getSubmitBtnOptions.label }}
          </ElButton>
        </div>
      </ElFormItem>
    </div>
  </ElCol>
</template>

<script lang="ts" setup>
  import type { ColProps as ElColProps } from 'element-plus';
  import type { ActionButtonProps } from '../types/form';

  import { CSSProperties, computed } from 'vue';
  import { ElCol, ElFormItem } from 'element-plus';
  import { useFormContext } from '../hooks/useFormContext';

  import { BasicIcon as Icon } from '@/components/Icon';

  defineOptions({ name: 'BasicFormAction' });

  const props = withDefaults(defineProps<{
    showActionButtonGroup: boolean;
    showResetButton: boolean;
    showSubmitButton: boolean;
    showAdvancedButton: boolean;
    resetButtonOptions: Partial<ActionButtonProps>;
    submitButtonOptions: Partial<ActionButtonProps>;
    actionColOptions: ElColProps;
    actionSpan: number;
    isAdvanced: boolean;
    hideAdvanceBtn: boolean;
  }>(), {
    showActionButtonGroup: true,
    showResetButton: true,
    showSubmitButton: true,
    showAdvancedButton: true,
    actionSpan: 6,
    resetButtonOptions: () => ({}),
    submitButtonOptions: () => ({}),
  });

  const emit = defineEmits(['toggle-advanced']);

  const { resetAction, submitAction } = useFormContext();

  const actionColOpt = computed(() => {
    const { showAdvancedButton, actionSpan: span, actionColOptions } = props;
    const actionSpan = 24 - span;
    const advancedSpanObj = showAdvancedButton ? { span: actionSpan < 6 ? 24 : actionSpan } : {};
    const actionColOpt: Partial<ElColProps & { style: CSSProperties}> = {
      style: { textAlign: 'right' },
      // @ts-ignore 此处可以忽略重写
      span: showAdvancedButton ? 6 : 4,
      ...advancedSpanObj,
      ...actionColOptions,
    };
    return actionColOpt;
  });

  const getResetBtnOptions = computed((): Partial<ActionButtonProps> => {
    return Object.assign(
      { type: 'primary', link: true, label: '重置' },
      props.resetButtonOptions,
    );
  });

  const getSubmitBtnOptions = computed((): Partial<ActionButtonProps> => {
    return Object.assign(
      { type: 'primary', label: '查询' },
      props.submitButtonOptions,
    );
  });

  function toggleAdvanced() {
    emit('toggle-advanced');
  }
</script>

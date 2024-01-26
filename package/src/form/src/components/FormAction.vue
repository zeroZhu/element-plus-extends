<template>
  <ElCol>
    <div>
      {{ getSubmitBtnOptions }}
      <ElFormItem>
        <slot name="resetBefore"></slot>
        <ElButton
          type="primary"
          class="mr-2"
          v-bind="getResetBtnOptions"
          @click="resetAction"
          v-if="showResetButton"
        >
          {{ getResetBtnOptions.syText }}
        </ElButton>
        <slot name="submitBefore"></slot>
        <ElButton
          type="primary"
          class="mr-2"
          v-bind="getSubmitBtnOptions"
          @click="submitAction"
          v-if="showSubmitButton"
        >
          {{ getSubmitBtnOptions.syText }}
        </ElButton>

        <slot name="advanceBefore"></slot>
        <ElButton
          v-if="showAdvancedButton && !hideAdvanceBtn"
          size="small"
          link
          @click="toggleAdvanced"
        >
          {{ isAdvanced ? '收起' : '展开' }}
        </ElButton>
        <slot name="advanceAfter"></slot>
      </ElFormItem>
    </div>
  </ElCol>
</template>

<script lang="ts" setup>
  import type { ColProps as ElColProps } from 'element-plus/lib/components/col';

  import { computed } from 'vue';
  import { ElCol, ElFormItem, ElButton } from 'element-plus';
  import { useFormContext } from '../hooks/useFormContext';

  defineOptions({ name: 'BasicFormAction' });

  const props = withDefaults(defineProps<{
    showActionButtonGroup: boolean;
    showResetButton: boolean;
    showSubmitButton: boolean;
    showAdvancedButton: boolean;
    resetButtonOptions: SYButtonProps;
    submitButtonOptions: SYButtonProps;
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

  const getResetBtnOptions = computed((): SYButtonProps => {
    return Object.assign(
      { type: 'primary', syText: '重置' },
      props.resetButtonOptions,
    );
  });

  const getSubmitBtnOptions = computed((): SYButtonProps => {
    return Object.assign(
      { syText: '查询' },
      props.submitButtonOptions,
    );
  });

  function toggleAdvanced() {
    emit('toggle-advanced');
  }
</script>

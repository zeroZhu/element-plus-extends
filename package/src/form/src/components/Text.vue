<template>
  <span class="basic-text" :style="getStyle">
    {{  props.modelValue }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isNumber } from 'lodash-es'
interface TextProps {
  modelValue?: string | number;
  size?: number | string;
  lineHeight?: number | string;
  color?: string;
}

defineOptions({ name: 'BasicText' })

const props = withDefaults(defineProps<TextProps>(), {
  fontSize: 12,
  color: '#323232'
});

const getStyle = computed(() => {
  const { fontSize, lineHeight, color } = props;
  return {
    fontSize: isNumber(fontSize) ? `${fontSize}px` : fontSize,
    lineHeight: isNumber(lineHeight) ? `${lineHeight}px` : lineHeight,
    color
  }
})
</script>

<template>
  <ElTableColumn v-bind="getBindValues">
    <template v-if="props.type === 'edit'" #default="{ row }">
      <ElInput :model-value="row[props.prop]" @change=""/>
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { BasicTableColumn } from '../types/tableColumn';
import { ElTableColumn, ElInput } from "element-plus";

defineOptions({ name: 'BasicTableColumn' });
const props = defineProps<BasicTableColumn>();

const getBindValues = computed(() => {

  return {

  }
});

const setTableField = () => {
  
}
</script>
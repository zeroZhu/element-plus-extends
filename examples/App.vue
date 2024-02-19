<script setup lang="ts">
  import HelloWorld from './components/HelloWorld.vue';
  import { type FormSchema, BasicForm } from '@package/src/form';

  const schemas: FormSchema[] = [
    {
      field: 'name',
      component: 'Input',
      label: '姓名'
    },
    {
      field: 'age',
      component: 'InputNumber',
      label: '年龄'
    },
  ]
</script>

<template>
  <div>
    <HelloWorld />
    <BasicForm :schemas="schemas" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

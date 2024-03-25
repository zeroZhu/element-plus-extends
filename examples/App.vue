<template>
  <div>
    <!-- <BasicForm @register="register" /> -->
    <HelloWorld></HelloWorld>
  </div>
</template>

<script setup lang="ts">
  import HelloWorld from './components/HelloWorld.vue';
  // import { type FormSchema, BasicForm, useForm } from '@package/src/Form';
  // const schemas: FormSchema[] = [
  //   {
  //     field: 'name',
  //     component: 'Input',
  //     label: '姓名'
  //   },
  //   {
  //     field: 'age',
  //     component: 'InputNumber',
  //     label: '年龄'
  //   },
  // ];
  // const [register, {}] = useForm({
  //   schemas
  // })

</script>

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

<template>
  <span
    ref="elRef"
    :class="[$attrs.class, 'app-iconify anticon', spin && 'app-iconify-spin']"
    :style="getWrapStyle"
  ></span>
</template>
<script lang="ts" setup>
import {
  ref,
  watch,
  onMounted,
  nextTick,
  unref,
  computed,
  CSSProperties,
} from "vue";
import Iconify from "@purge-icons/generated";
import { isString } from "lodash-es";

const SVG_END_WITH_FLAG = "|svg";
interface Props {
  // icon name
  icon: string;
  // icon color
  color: string;
  // icon size
  size: string | number;
  spin: boolean;
  prefix: string;
}
const props = defineProps<Partial<Props>>();
const elRef = ref();

const isSvgIcon = computed(() => props.icon?.endsWith(SVG_END_WITH_FLAG));
// const getSvgIcon = computed(() => props.icon.replace(SVG_END_WITH_FLAG, ""));
const getIconRef = computed(
  () => `${props.prefix ? props.prefix + ":" : ""}${props.icon}`
);

const update = async () => {
  if (unref(isSvgIcon)) return;

  const el = unref(elRef);
  if (!el) return;

  await nextTick();
  const icon = unref(getIconRef);
  if (!icon) return;

  const svg = Iconify.renderSVG(icon, {});
  if (svg) {
    el.textContent = "";
    el.appendChild(svg);
  } else {
    const span = document.createElement("span");
    span.className = "iconify";
    span.dataset.icon = icon;
    el.textContent = "";
    el.appendChild(span);
  }
};

const getWrapStyle = computed((): CSSProperties => {
  const { size, color } = props;
  let fs = size;
  if (isString(size)) {
    fs = parseInt(size, 10);
  }

  return {
    fontSize: `${fs}px`,
    color: color,
    display: "inline-flex",
  };
});

watch(() => props.icon, update, { flush: "post" });

onMounted(update);

</script>
<style lang="less">
.app-iconify {
  display: inline-block;
  // vertical-align: middle;

  &-spin {
    svg {
      animation: loadingCircle 1s infinite linear;
    }
  }
}

span.iconify {
  display: block;
  min-width: 1em;
  min-height: 1em;
  border-radius: 100%;
}
</style>

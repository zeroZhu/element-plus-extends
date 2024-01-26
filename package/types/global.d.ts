import { ButtonProps } from 'element-plus/lib/components/button'

declare global {
  // 二次全局声明Button类
  interface SYButtonProps extends Partial<ElButtonProps> {
    onClick?: () => void;
    syText?: string;
  }

  namespace JSX {
    type Element = VNode;

    type ElementClass = ComponentRenderProxy;
    interface ElementAttributesProperty {
      $props: any;
    }
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface IntrinsicAttributes {
      [elem: string]: any;
    }
  }
}

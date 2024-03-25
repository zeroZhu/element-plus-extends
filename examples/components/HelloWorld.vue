<script lang="tsx">
import { defineComponent } from 'vue';
import { ElForm, ElFormItem, ElInput } from 'element-plus';

export default defineComponent({
  name: 'HelloWorld',
  setup(_props, { slots }) {
    console.log('slots ===', slots);
    return () => {
      return (
        <div>
          <h5>HelloWorld</h5>
          <ElForm>
            <ElFormItem>
              {{
                default: () => <ElInput />,
                label: () => 1111
              }}
            </ElFormItem>
          </ElForm>
        </div>
      )
    }
  }
})
</script>


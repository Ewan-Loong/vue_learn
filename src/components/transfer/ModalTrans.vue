<!-- ModalTrans.vue -->
<template>
  <a-modal
      :title="mode === 'create' ? '新增' : '编辑'"
      :open="open"
      :mask-closable="false"
      :keyboard="true"
      :destroy-on-close="true"
      @ok="submit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
      width="720px"
      ok-text="确定"
      cancel-text="取消"
  >
    <GenericTrans
        ref="transferRef"
        v-model:target-keys="localTargetKeys"
        v-model:selected-keys="localSelectedKeys"
        :data-source="dataSource"
        :titles="titles"
        :show-title="showTitle"
        :operations="operations"
        :list-style="{ width: '300px', height: '400px' }"
        @submit="handleSubmit"
        @reset="onReset"
    >
      <!-- 透传 footer 插槽 -->
      <template #footer="{ direction }" v-if="$slots.footer">
        <slot name="footer" :direction="direction"/>
      </template>
    </GenericTrans>
  </a-modal>
</template>

<script>
import GenericTrans from './GenericTrans.vue';

export default {
  name: 'ModalTrans',
  components: {GenericTrans},
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: Array,
      required: true,
      default: () => [],
    },
    targetKeys: {
      type: Array,
      default: () => [],
    },
    selectedKeys: {
      type: Array,
      default: () => [],
    },
    titles: {
      type: Array,
    },
    showTitle: {
      type: String,
      default: 'title',
    },
    operations: {
      type: Array,
    },
    submitting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['submit', 'cancel', 'update:open', 'update:targetKeys'],
  computed: {
    mode() {
      // 根据初始 targetKeys 是否有值判断是 create 还是 edit
      return this.targetKeys?.length > 0 ? 'edit' : 'create';
    },
  },
  data() {
    return {
      localTargetKeys: [],
      localSelectedKeys: [],
    };
  },
  watch: {
    // 同步 props 到本地
    targetKeys: {
      handler(val) {
        this.localTargetKeys = [...(val || [])];
      },
      immediate: true,
    },
    selectedKeys: {
      handler(val) {
        this.localSelectedKeys = [...(val || [])];
      },
      immediate: true,
    },
  },
  methods: {
    submit() {
      // 触发 GenericTrans 内部提交（或直接 emit）
      this.handleSubmit();
    },
    handleSubmit() {
      // 提交当前选中项
      this.$emit('submit', {targetKeys: this.localTargetKeys});
      // 同步更新 targetKeys
      this.$emit('update:targetKeys', this.localTargetKeys);
    },
    handleCancel() {
      this.$emit('update:open', false);
      this.$emit('cancel');
    },
    onReset() {
      // 重置为初始值（由父组件控制，这里仅同步）
      this.localTargetKeys = [...(this.targetKeys || [])];
      this.localSelectedKeys = [...(this.selectedKeys || [])];
    },
  },
};
</script>

<style scoped>
:deep(.ant-modal-body) {
  padding: 16px 24px;
}
</style>
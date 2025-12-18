<!-- GenericTrans.vue -->
<template>
  <a-transfer
      :target-keys="curTargetKeys"
      :selected-keys="curSelectedKeys"
      :data-source="dataSource"
      :titles="titles"
      :render="getTitle"
      :operations="operations"
      show-search
      :locale="locale"
      :list-style="listStyle"
      @change="handleChange"
      @selectChange="handleSelectChange"
  >
    <!-- 透传 footer 插槽 -->
    <template #footer="{ direction }" v-if="$slots.footer">
      <slot name="footer" :direction="direction"/>
    </template>
  </a-transfer>
</template>

<script>
export default {
  name: 'GenericTrans',
  props: {
    targetKeys: {
      type: Array,
      default: () => [],
    },
    selectedKeys: {
      type: Array,
      default: () => [],
    },
    dataSource: {
      type: Array,
      required: true,
      default: () => [],
    },
    showTitle: {
      type: String,
      default: 'title',
    },
    titles: {
      type: Array,
      default: () => ['可选', '已选'],
    },
    operations: {
      type: Array,
      default: () => ['添加', '删除'],
    },
    listStyle: {
      type: Object,
      default: () => ({
        width: '320px',
        height: '420px',
      }),
    },
  },
  data() {
    return {
      internalTargetKeys: [],
      internalSelectedKeys: [],
      locale: {
        selectAll: '全选',
        selectInvert: '反选',
        itemUnit: '项',
        itemsUnit: '项',
        notFoundContent: '暂无数据',
        searchPlaceholder: '搜索...'
      },
    };
  },
  computed: {
    curTargetKeys: {
      get() {
        return this.targetKeys?.length >= 0 ? this.targetKeys : this.internalTargetKeys;
      },
      set(val) {
        this.internalTargetKeys = val;
      },
    },
    curSelectedKeys: {
      get() {
        return this.selectedKeys?.length >= 0 ? this.selectedKeys : this.internalSelectedKeys;
      },
      set(val) {
        this.internalSelectedKeys = val;
      },
    },
  },
  methods: {
    getTitle(item) {
      return item[this.showTitle] || item.title || item.key || '';
    },

    handleChange(targetKeys) {
      this.curTargetKeys = targetKeys;
      this.$emit('update:targetKeys', targetKeys);
    },

    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      const newSelectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
      this.curSelectedKeys = newSelectedKeys;
      this.$emit('update:selectedKeys', newSelectedKeys);
      this.$emit('selectChange', sourceSelectedKeys, targetSelectedKeys);
    },

    // 暴露给父组件的方法（通过 ref 调用）
    handleSubmit() {
      this.$emit('submit', {targetKeys: this.curTargetKeys});
    },

    handleCancel() {
      // 重置为初始 props 值
      this.curTargetKeys = [...(this.targetKeys || [])];
      this.curSelectedKeys = [...(this.selectedKeys || [])];
      this.$emit('update:targetKeys', this.curTargetKeys);
      this.$emit('update:selectedKeys', this.curSelectedKeys);
      this.$emit('reset');
    },
  },
};
</script>

<style scoped>

:deep(.ant-transfer-list) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

:deep(.ant-transfer-list-header) {
  padding: 8px 12px;
  font-weight: 600;
  background-color: #fafafa;
}

:deep(.ant-transfer-list-content-item) {
  padding: 6px 12px;
  font-size: 14px;
}
</style>
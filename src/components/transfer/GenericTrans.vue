<template>
  <a-spin :spinning="loading" size="large" tip="加载中...">
    <a-transfer
        :target-keys="internalTargetKeys"
        :selected-keys="internalSelectedKeys"
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
      <template #footer="{ direction }">
        <div v-if="direction === 'right'" class="transfer-footer">
          <a-button size="small" :disabled="isDisable" @click="handleCancel">重置</a-button>
          <a-button size="small" :disabled="isDisable" type="primary"
                    @click="handleSubmit" style="margin-left: 8px;" :loading="submitting">
            保存
          </a-button>
        </div>
      </template>
    </a-transfer>
  </a-spin>
</template>

<script>
export default {
  name: 'GenericTrans',
  props: {
    loading: {type: Boolean, default: false},
    targetKeys: {type: Array[Object], default: () => [],},
    selectedKeys: {type: Array[Object], default: () => [],},
    dataSource: {type: Array[Object], required: true, default: () => [],},
    showTitle: {type: String, default: 'title',},
    titles: {type: Array, default: () => ['可选', '已选'],},
    operations: {type: Array, default: () => ['添加', '删除'],},
    listStyle: {type: Object, default: () => ({width: '300px', height: '400px',}),},
    submitting: {type: Boolean, default: false},
  },
  emits: ['submit', 'reset'],
  data() {
    return {
      isDisable: true,
      internalTargetKeys: [...this.targetKeys],
      internalSelectedKeys: [...this.selectedKeys],
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
  methods: {
    getTitle(item) {
      if (typeof item === 'string') {
        return item;
      }
      return (
          (item && typeof item === 'object' && item[this.showTitle]) ||
          item.title ||
          item.key ||
          ''
      );
    },

    handleChange(targetKeys) {
      this.isDisable = false
      this.internalTargetKeys = targetKeys;
    },

    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      this.internalSelectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
    },

    handleSubmit() {
      const addKeys = this.internalTargetKeys.filter(key => !this.targetKeys.includes(key));
      const removeKeys = this.targetKeys.filter(key => !this.internalTargetKeys.includes(key));

      this.$emit('submit', {
        targetKeys: this.internalTargetKeys,
        selectedKeys: this.internalSelectedKeys,
        addKeys,
        removeKeys
      });
    },

    handleCancel() {
      this.isDisable = true
      // 重置为初始 props 值
      this.internalTargetKeys = [...this.targetKeys];
      this.internalSelectedKeys = [...this.selectedKeys];
      this.$emit('reset');
    },
  },
  watch: {
    targetKeys: {
      handler(newVal) {
        this.internalTargetKeys = [...newVal];
        this.isDisable = true;
      },
      immediate: true
    },
    selectedKeys: {
      handler(newVal) {
        this.internalSelectedKeys = [...newVal];
      },
      immediate: true
    }
  },
};
</script>

<style scoped>
.transfer-footer {
  display: flex;
  justify-content: flex-end;
  padding: 6px 12px 0;
  gap: 8px;
}

:deep(.ant-transfer-list) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

:deep(.ant-transfer-list-header) {
  padding: 8px 12px;
  font-weight: 600;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-transfer-list-content-item) {
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.ant-transfer-list-content-item):focus-visible {
  outline: 2px solid #1890ff;
  outline-offset: -2px;
}

:deep(.ant-transfer-list-body-search-wrapper .ant-input-affix-wrapper) {
  padding: 4px 11px;
}
</style>
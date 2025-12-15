<template>
  <GenericTable
      :raw-data="tableData"
      :raw-columns="columns"
      add-api="ProdAdd"
      edit-api="ProdUpdate"
      delete-api="ProdDelete"
      :loading="loading"
      @action-success="refreshData"
  >
    <!-- 标签列插槽 -->
    <template #tags="{ value }">
      <div class="tags-cell">
        <a-tag
            v-for="tag in value || []"
            :key="tag.tid"
            color="blue"
            style="margin-bottom: 4px;"
        >
          {{ tag.tname }}
        </a-tag>
        <span v-if="!(value && value.length)" class="no-tags">暂无标签</span>
      </div>
    </template>

    <!-- 列插槽：自定义操作列 -->
    <template #action="{ record }">
      <a-space size="small">
        <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
        <a-button type="link" size="small" @click="showEditForm(record)">编辑</a-button>
        <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
      </a-space>
    </template>
  </GenericTable>

  <!-- 编辑/新增抽屉表单 -->
  <DrawerForm
      v-model:open="formDrawerOpen"
      :form-items="formItemsForDrawer"
      :initial-values="initialValuesForDrawer"
      :submitting="saving"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
  />
</template>

<script>

import GenericTable from '@/components/table/GenericTable';

export default {
  name: "ProdList",
  components: {GenericTable},
  data() {
    return {
      loading: false,
      tableData: [],
      columns: [
        {title: '产品ID', dataIndex: 'pid', key: 'pid', width: 100, showInAdd: false, editable: false},
        {title: '用户ID', dataIndex: 'uid', key: 'uid', width: 100, showInAdd: false, editable: false},
        {title: '产品名称', dataIndex: 'pname', key: 'pname'},
        {title: '产品信息', dataIndex: 'info', key: 'info',},
        {title: '创建时间', dataIndex: 'c_date', type: 'date', key: 'c_date',},
        {title: '标签', dataIndex: 'tags', key: 'tags', type: 'checkbox', slotName: 'tags'}, // 使用插槽
      ],
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        // 实际请求示例：
        await this.$api.post('ProdQuery').then(response => {
          this.tableData = response.data
        })
      } catch (error) {
        console.error('refreshData failed:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.refreshData()
  }
}
</script>

<style scoped>

</style>
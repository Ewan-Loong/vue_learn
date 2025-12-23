<template>
  <div class="list-container">
    <!-- 表格 -->
    <GenericTable
        :raw-data="tableData"
        :raw-columns="columns"
        :loading="loading"
        @action-success="refreshData"
    />
  </div>
</template>

<script>
import GenericTable from '@/components/table/GenericTable';

export default {
  name: "PermissionList",
  components: {GenericTable},
  data() {
    return {
      loading: false,
      tableData: [],
      detailDrawerOpen: false,
      formDrawerOpen: false,
      currentEditRecord: null, // null 表示新增，非 null 表示编辑
      saving: false,
      columns: [
        {title: '主键', dataIndex: 'id', key: 'rid',},
        {title: '权限编码', dataIndex: 'code', key: 'rcode'},
        {title: '权限名', dataIndex: 'name', key: 'rname'},
        {title: '描述', dataIndex: 'description', key: 'description'},
        {title: '权限类别', dataIndex: 'category', key: 'category'},
        {title: '管控资源范围', dataIndex: 'scope', key: 'scope',},
        {title: '创建时间', dataIndex: 'c_date', key: 'c_date'}
      ],
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        const response = await this.$api.post('PermissionQuery');
        this.tableData = response.data;
      } catch (error) {
        console.error('refreshData failed:', error);
        this.$message.error('数据加载失败');
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.refreshData();
  }
}
</script>

<style scoped>
.list-container {
  padding: 2px;
  height: 100%;
  box-sizing: border-box;
}
</style>
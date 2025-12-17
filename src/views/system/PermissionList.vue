<template>
  <div class="list-container">
    <!-- 表格 -->
    <GenericTable
        :raw-data="tableData"
        :raw-columns="columns"
        :loading="loading"
        @action-success="refreshData"
    >
      <!-- 列插槽：自定义操作列 -->
      <template #action="{ record }">
        <a-space size="small">
          <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
          <a-button type="link" size="small" @click="showEditForm(record)">编辑</a-button>
          <a-button type="link" size="small" danger @click="handleDelete(record)">删除
          </a-button>
        </a-space>
      </template>

      <!-- 自定义工具栏 -->
      <template #toolbar-right>
        <a-button type="primary" @click="showAddForm">新增权限</a-button>
      </template>
    </GenericTable>

    <!-- 详情抽屉 -->
    <DrawerDesc
        v-model:open="detailDrawerOpen"
        :title="`权限详情 - ${currentEditRecord?.rname}`"
        :form-items="formItemsForDrawer"
        :record="currentEditRecord"
        @cancel="handleCancelDetail"
        v-if="currentEditRecord"
    />

    <!-- 编辑/新增抽屉表单 -->
    <DrawerForm
        v-model:open="formDrawerOpen"
        :title="`权限 ${currentEditRecord ? currentEditRecord.rname+' ' : ''}`"
        :form-items="formItemsForDrawer"
        :initial-values="initialValuesForDrawer"
        :submitting="saving"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
    />
  </div>
</template>

<script>
import GenericTable from '@/components/table/GenericTable';
import DrawerForm from '@/components/form/DrawerForm.vue';
import DrawerDesc from '@/components/descriptions/DrawerDesc.vue';

import {customRegExp, noSpecialChars, stringLength} from "@/utils/formValidators";

export default {
  name: "PermissionList",
  components: {GenericTable, DrawerForm, DrawerDesc},
  data() {
    return {
      loading: false,
      tableData: [],
      detailDrawerOpen: false,
      formDrawerOpen: false,
      currentEditRecord: null, // null 表示新增，非 null 表示编辑
      saving: false,
      columns: [
        {title: '主键', dataIndex: 'id', key: 'rid', type: 'number', showInAdd: false, showInEdit: false},
        {
          title: '权限编码',
          dataIndex: 'code',
          key: 'rcode',
          rules: [customRegExp(/[a-zA-Z]:[a-zA-Z*]/, '仅允许格式[英文字母:英文或*]')]
        },
        {title: '权限名', dataIndex: 'name', key: 'rname', rules: [noSpecialChars()]},
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description',
          rules: [noSpecialChars(), stringLength({max: 128})]
        },
        {
          title: '权限类别',
          dataIndex: 'category',
          key: 'category',
          showInAdd: false,
          showInEdit: false
        },
        {
          title: '管控资源范围',
          dataIndex: 'scope',
          key: 'scope',
        },
        {title: '创建时间', dataIndex: 'c_date', key: 'c_date', showInAdd: false, showInEdit: false},
        {
          title: '操作',
          key: 'action',
          slotName: 'action',
          fixed: 'right'
        }
      ],
    }
  },
  computed: {
    isAddMode() {
      return this.currentEditRecord === null;
    },

    formItemsForDrawer() {
      return this.columns.filter(col => {
        if (!col) return false;
        if (!col.dataIndex) return false;
        return this.isAddMode ? col.showInAdd !== false : true;
      });
    },

    initialValuesForDrawer() {
      if (this.isAddMode) {
        // const values = {};
        // this.columns.forEach(col => {
        //   if (col.dataIndex && col.showInAdd !== false) {
        //     values[col.dataIndex] = col.defaultValue ?? '';
        //   }
        // });
        // return values;
        return {}
      } else {
        return {...this.currentEditRecord};
      }
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
    },

    showDetail(record) {
      this.currentEditRecord = {...record};
      this.detailDrawerOpen = true;
    },

    showEditForm(record) {
      this.currentEditRecord = {...record};
      this.formDrawerOpen = true;
    },

    showAddForm() {
      this.currentEditRecord = null;
      this.formDrawerOpen = true;
    },

    handleParse(parseRes) {
      console.log(parseRes.data.data)
      this.handleFormSubmit(parseRes.data.data)
    },

    async handleFormSubmit(formData) {
      const isAdd = this.isAddMode;
      const api = isAdd ? 'PermissionAdd' : 'PermissionUpdate';

      if (!api) {
        this.formDrawerOpen = false;
        return;
      }

      this.saving = true;
      try {
        await this.$api.request(api, Array.isArray(formData) ? {values: formData} : {...formData});
        this.$message.success(isAdd ? '新增成功' : '修改成功');
        this.refreshData();
        this.formDrawerOpen = false;
      } catch (error) {
        console.error(isAdd ? '新增失败:' : '保存失败:', error);
        this.$message.error(isAdd ? '新增失败' : '保存失败');
      } finally {
        this.saving = false;
      }
    },

    handleFormCancel() {
      this.formDrawerOpen = false;
      this.currentEditRecord = null;
    },

    async handleDelete(record) {
      const deleteApi = 'PermissionDelete';

      this.$confirm({
        title: '确认删除',
        content: '确定要删除此条记录吗？',
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            await this.$api.request(deleteApi, {...record});
            this.$message.success('删除成功');
            this.refreshData();
          } catch (error) {
            console.error('删除失败:', error);
            this.$message.error('删除失败');
          }
        },
      });
    },

    handleCancelDetail() {
      this.detailDrawerOpen = false;
      this.currentEditRecord = null;
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
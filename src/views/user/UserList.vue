<template>
  <div class="user-list-container">
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
          <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>

      <!-- 自定义工具栏 -->
      <template #toolbar-right>
        <FileUpload
            upload-api="UploadFile"
            accept=".xlsx,.xls,.csv,.txt,.json"
            parse-api="ParseFile"
            button-text="导入用户"
            @parse-complete="handleParse"
        />
        <a-button type="primary" @click="showAddForm">新增用户</a-button>
      </template>

      <!-- 在线状态列插槽 -->
      <template #on_line="{ value }">
        <a-tag :color="value === 1 ? 'green' : 'red'">
          {{ value === 1 ? '在线' : '离线' }}
        </a-tag>
      </template>
    </GenericTable>

    <!-- 详情抽屉 -->
    <DrawerDesc
        v-model:open="detailDrawerOpen"
        :title="`用户详情 - ${currentEditRecord?.name}`"
        :form-items="formItemsForDrawer"
        :record="currentEditRecord"
        @cancel="handleCancelDetail"
        v-if="currentEditRecord"
    />

    <!-- 编辑/新增抽屉表单 -->
    <DrawerForm
        v-model:open="formDrawerOpen"
        :title="`用户 ${currentEditRecord ? currentEditRecord.name+' ' : ''}`"
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

import FileUpload from "@/components/FileUpload";
import {passwordComplexity, stringLength} from "@/utils/formValidators";

export default {
  name: "UserList",
  components: {GenericTable, DrawerForm, DrawerDesc, FileUpload},
  data() {
    return {
      loading: false,
      tableData: [],
      detailDrawerOpen: false,
      formDrawerOpen: false,
      currentEditRecord: null, // null 表示新增，非 null 表示编辑
      saving: false,
      columns: [
        {title: '用户ID', dataIndex: 'uid', key: 'uid', type: 'number', showInAdd: false, editable: false},
        {title: '用户名', dataIndex: 'name', key: 'name', rules: [stringLength({max: 20})]},
        {title: '角色ID', dataIndex: 'rid', key: 'rid', type: 'select'},
        {title: '角色编码', dataIndex: 'rcode', key: 'rcode', showInAdd: false, showInEdit: false},
        {title: '角色名', dataIndex: 'rname', key: 'rname', showInAdd: false, showInEdit: false},
        {title: '出生年月', dataIndex: 'birthdt', key: 'birthdt', type: 'date'},
        {title: '密码', dataIndex: 'passwd', key: 'passwd', type: 'password', rules: [passwordComplexity()]},
        {
          title: '是否在线',
          dataIndex: 'on_line',
          slotName: 'on_line',
          key: 'on_line',
          type: 'number',
          showInAdd: false,
          showInEdit: false
        },
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
        const response = await this.$api.post('UserQuery');
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
      const api = isAdd ? 'UserAdd' : 'UserUpdate';

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
      const deleteApi = 'UserDelete';

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
.user-list-container {
  padding: 2px;
  height: 100%;
  box-sizing: border-box;
}
</style>
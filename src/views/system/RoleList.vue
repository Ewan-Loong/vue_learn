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
          <a-button v-if="record.is_system !== 1" type="link" size="small" @click="showEditForm(record)">编辑</a-button>
          <a-button v-if="record.is_system !== 1" type="link" size="small" danger @click="handleDelete(record)">删除
          </a-button>
        </a-space>
      </template>

      <!-- 自定义工具栏 -->
      <template #toolbar-right>
        <a-button type="primary" @click="showAddForm">新增角色</a-button>
      </template>

      <!-- 是否内置列插槽 -->
      <template #is_system="{ value }">
        <a-tag :color="value === 1 ? 'green' : 'red'">
          {{ value === 1 ? '是' : '否' }}
        </a-tag>
      </template>
    </GenericTable>

    <!-- 详情抽屉 -->
    <DrawerDesc
        v-model:open="detailDrawerOpen"
        :title="`角色详情 - ${currentEditRecord?.rname}`"
        :form-items="formItemsForDrawer"
        :record="currentEditRecord"
        @cancel="handleCancelDetail"
        v-if="currentEditRecord"
    />

    <!-- 编辑/新增抽屉表单 -->
    <DrawerForm
        v-model:open="formDrawerOpen"
        :title="`角色 ${currentEditRecord ? currentEditRecord.rname+' ' : ''}`"
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

import {noSpecialChars, stringLength} from "@/utils/formValidators";

export default {
  name: "RoleList",
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
        {title: '角色ID', dataIndex: 'rid', key: 'rid', type: 'number', showInAdd: false, showInEdit: false},
        {title: '角色编码', dataIndex: 'rcode', key: 'rcode', rules: [noSpecialChars()]},
        {title: '角色名', dataIndex: 'rname', key: 'rname', rules: [noSpecialChars()]},
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description',
          rules: [noSpecialChars(), stringLength({max: 128})]
        },
        {
          title: '是否内置',
          dataIndex: 'is_system',
          slotName: 'is_system',
          key: 'is_system',
          type: 'number',
          showInAdd: false,
          showInEdit: false
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
        const response = await this.$api.post('RoleQuery');
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
      const api = isAdd ? 'RoleAdd' : 'RoleUpdate';

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
      const deleteApi = 'RoleDelete';

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
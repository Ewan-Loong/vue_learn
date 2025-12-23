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
          <a-button type="link" size="small" @click="showRole(record)">权限</a-button>
          <!-- <a-button type="link" size="small" @click="showMember(record)">成员</a-button>-->
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

    <!-- 角色权限对话框 -->
    <ModalTrans
        v-model:open="RoleModalopen"
        :loading="loading"
        :target-keys="RoleTargetKeys"
        :selected-keys="RoleSelectedKeys"
        :data-source="RoleOptions"
        :submitting="saving"
        show-title="name"
        :modal-title="currentEditRecord?.rname+' 权限'"
        @submit="onRoleSubmit"
        @cancel="onRoleCancel"
    />

    <!-- 角色成员对话框 -->
    <!--    <ModalTrans-->
    <!--        v-model:open="MemberModalopen"-->
    <!--        :target-keys="MemberTargetKeys"-->
    <!--        :selected-keys="MemberSelectedKeys"-->
    <!--        :data-source="MemberOptions"-->
    <!--        :submitting="saving"-->
    <!--        show-title="name"-->
    <!--        :modal-title="currentEditRecord?.rname+' 成员'"-->
    <!--        @submit="onMemberSubmit"-->
    <!--    />-->

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
import GenericTable from '@/components/table/GenericTable.vue';
import DrawerForm from '@/components/form/DrawerForm.vue';

import {noSpecialChars, stringLength} from "@/utils/formValidators";
import ModalTrans from "@/components/transfer/ModalTrans.vue";

export default {
  name: "RoleList",
  components: {ModalTrans, GenericTable, DrawerForm},
  data() {
    return {
      loading: false,
      tableData: [],
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

      RoleModalopen: false,
      RoleTargetKeys: [],
      RoleSelectedKeys: [],
      RoleOptions: [],

      // MemberModalopen: false,
      // MemberTargetKeys: [],
      // MemberSelectedKeys: [],
      // MemberOptions: [],
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
        this.$message.error('角色数据加载失败');
      } finally {
        this.loading = false;
      }
    },

    async refreshRoleData() {
      try {
        const response = await this.$api.post('PermissionQuery');
        this.RoleOptions = response.data.map(i => ({...i, key: String(i.id)}))
      } catch (error) {
        console.error('refreshRoleData failed:', error);
        this.$message.error('权限数据加载失败');
      }
    },

    async showRole(record) {
      this.loading = true;
      this.RoleModalopen = true;
      try {
        this.currentEditRecord = {...record};
        const response = await this.$api.post('RolePermissionQuery', {'role_id': record.rid});
        this.RoleTargetKeys = response.data?.map(i => String(i.id));
        console.log(this.RoleTargetKeys)
      } catch (error) {
        console.error('showRole failed:', error);
        this.$message.error('角色权限数据加载失败');
      } finally {
        this.loading = false;
      }
    },

    async onRoleSubmit({addKeys, removeKeys}) {
      this.saving = true
      try {
        if (addKeys)
          await this.$api.post('RolePermissionAdd', {
            role_id: this.currentEditRecord.rid,
            permission_id_list: addKeys
          })

        if (removeKeys)
          await this.$api.post('RolePermissionDelete', {
            role_id: this.currentEditRecord.rid,
            permission_id_list: removeKeys
          })

        this.RoleModalopen = false
        this.$message.success('权限调整成功');
      } catch (error) {
        console.error('权限调整失败', error);
        this.$message.error('权限调整失败');
      } finally {
        this.saving = false
      }
    },

    onRoleCancel() {
      this.RoleModalopen = false;
      this.currentEditRecord = null;
      this.RoleTargetKeys = [];
    },

    // showMember(record) {
    //   this.currentEditRecord = {...record};
    //   this.MemberModalopen = true;
    // },

    // onMemberSubmit({targetKeys}) {
    //   this.saving = true
    //   try {
    //     console.log('子组件 emit 提交:', targetKeys)
    //     this.MemberModalopen = false
    //   } catch (e) {
    //     console.log(e)
    //   } finally {
    //     this.saving = false
    //   }
    // },


    showEditForm(record) {
      this.currentEditRecord = {...record};
      this.formDrawerOpen = true;
    },

    showAddForm() {
      this.currentEditRecord = null;
      this.formDrawerOpen = true;
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
  },
  created() {
    this.refreshData();
    this.refreshRoleData()
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
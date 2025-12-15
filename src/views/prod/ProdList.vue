<template>
  <div class="prod-list-container">
    <!-- 表格 -->
    <GenericTable
        :loading="loading"
        :raw-columns="columns"
        :raw-data="tableData"
        @action-success="refreshData"
    >
      <!-- 列插槽：自定义操作列 -->
      <template #action="{ record }">
        <a-space size="small">
          <a-button size="small" type="link" @click="showDetail(record)">详情</a-button>
          <a-button size="small" type="link" @click="showEditForm(record)">编辑</a-button>
          <a-button danger size="small" type="link" @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>

      <!-- 标签列插槽 -->
      <template #tags="{ value }">
        <div class="tags-cell">
          <a-tag
              v-for="tag in value || []"
              :key="tag.tid"
              color="blue"
              style="margin-bottom: 4px;"
          > {{ tag.tname }}
          </a-tag>
          <a-tag v-if="!(value && value.length)" color="default">无</a-tag>
        </div>
      </template>

      <!-- 自定义工具栏 -->
      <template #toolbar-right>
        <FileUpload
            accept=".xlsx,.xls,.csv,.txt,.json"
            button-text="导入产品"
            parse-api="ParseFile"
            upload-api="UploadFile"
            @parse-complete="handleParse"
        />
        <a-button type="primary" @click="showAddForm">新增产品</a-button>
      </template>
    </GenericTable>


    <!-- 详情抽屉 -->
    <DrawerDesc
        v-model:open="detailDrawerOpen"
        :title="`产品详情 - ${currentEditRecord?.pid}`"
        :form-items="formItemsForDrawer"
        :record="currentEditRecord"
        @cancel="handleCancelDetail"
        v-if="currentEditRecord"
    />

    <!-- 编辑/新增抽屉表单 -->
    <DrawerForm
        v-model:open="formDrawerOpen"
        :form-items="formItemsForDrawer"
        :initial-values="initialValuesForDrawer"
        :submitting="saving"
        @cancel="handleFormCancel"
        @submit="handleFormSubmit"
    />
  </div>
</template>

<script>
import GenericTable from '@/components/table/GenericTable';
import DrawerForm from '@/components/form/DrawerForm.vue';
import FileUpload from "@/components/FileUpload";
import {CheckedRange, notAfterToday, stringLength} from "@/utils/formValidators";
import DrawerDesc from "@/components/descriptions/DrawerDesc.vue";

export default {
  name: "ProdList",
  components: {DrawerDesc, GenericTable, DrawerForm, FileUpload},
  data() {
    return {
      loading: false,
      tableData: [],
      tagData: [],
      detailDrawerOpen: false,
      formDrawerOpen: false,
      currentEditRecord: null, // null 表示新增，非 null 表示编辑
      saving: false,
      columns: [
        {title: '产品ID', dataIndex: 'pid', key: 'pid', showInAdd: false, editable: false},
        {title: '用户ID', dataIndex: 'uid', key: 'uid', showInAdd: false, editable: false},
        {title: '产品名称', dataIndex: 'pname', key: 'pname'},
        {title: '产品信息', dataIndex: 'info', key: 'info', rules: [stringLength({max: 50})]},
        {
          title: '创建时间',
          dataIndex: 'c_date',
          type: 'date',
          key: 'c_date',
          rules: [notAfterToday()],
          required: true,
        },
        {
          title: '标签',
          dataIndex: 'tags',
          key: 'tags',
          type: 'tree',
          slotName: 'tags',
          options: [],
          multiple: true,
          fieldNames: {children: 'child', label: 'tname', value: 'tid'},
          rules: [CheckedRange({max: 3})]
        }, // 使用插槽
        {title: '操作', key: 'action', slotName: 'action', fixed: 'right'}
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
        const values = {};
        // this.columns.forEach(col => {
        //   if (col.dataIndex && col.showInAdd !== false) {
        //     // 特殊处理标签值
        //     if (col.dataIndex === 'tags')
        //       values[col.dataIndex] = []
        //     else
        //       values[col.dataIndex] = col.defaultValue ?? '';
        //   }
        // });
        const currentUser = JSON.parse(localStorage.getItem('user'));
        values['uid'] = currentUser.uid
        return values;
      } else {
        return {...this.currentEditRecord};
      }
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        await this.$api.post('ProdQuery').then(response => {
          this.tableData = response.data
        })
        await this.$api.get('TagQuery').then(response => {
          this.tagData = response.data
          this.columns[5]['options'] = this.tagData
        })
      } catch (error) {
        console.error('refreshData failed:', error);
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
      this.currentEditRecord.tags = record.tags.map(itme => itme.tid);
      this.formDrawerOpen = true;
    },

    showAddForm() {
      this.currentEditRecord = null;
      this.formDrawerOpen = true;
    },

    handleParse(parseRes) {
      this.handleFormSubmit(parseRes.data.data)
    },

    async handleFormSubmit(formData) {
      const isAdd = this.isAddMode;
      const api = isAdd ? 'ProdAdd' : 'ProdUpdate';

      if (!api) {
        this.formDrawerOpen = false;
        return;
      }

      this.saving = true;
      try {
        let promise;
        promise = this.$api.request(api, Array.isArray(formData) ? {values: formData} : {...formData});
        await promise;
        this.$message.success(isAdd ? '新增成功' : '修改成功');
        this.refreshData();
        this.formDrawerOpen = false;
      } catch (error) {
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
      const deleteApi = 'ProdDelete';

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
    this.refreshData()
  }
}
</script>

<style scoped>
.prod-list-container {
  padding: 2px;
  height: 100%;
  box-sizing: border-box;
}
</style>
<template>
  <div class="prod-stock-container">
    <!-- 表格 -->
    <GenericTable
        :loading="loading"
        :raw-columns="columnsStock"
        :raw-data="tableData"
        @action-success="refreshData"
    >
      <!-- 列插槽：自定义操作列 -->
      <template #action="{ record }">
        <a-space size="small">
          <a-button size="small" type="link" @click="showEditForm(record)">出入库</a-button>
          <a-button size="small" type="link" @click="showStockLog(record)">库存记录</a-button>
        </a-space>
      </template>
      <!-- 自定义工具栏 -->
      <template #toolbar-right>
        <FileUpload
            accept=".xlsx,.xls,.csv,.txt,.json"
            button-text="导入产品库存"
            parse-api="ParseFile"
            upload-api="UploadFile"
            @parse-complete="handleParse"
        />
        <a-button type="primary" @click="showAddForm">新增产品库存</a-button>
      </template>
    </GenericTable>

    <!-- 详情表抽屉 -->
    <ModalTable
        v-model:open="detailDrawerOpen"
        :loading="loading"
        :raw-columns="columnsStockLog"
        :raw-data="detailtableData"
        :title="`库存详情`"
        :width="1000"
        @cancel="handleFormCancel"
    >
      <!-- 标签列插槽 -->
      <template #op_type="{ value }">
        <a-tag
            :key="value"
            color="blue"
        > {{ value === 1 ? '入库' : '出库' }}
        </a-tag>
      </template>
    </ModalTable>

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
import GenericTable from '@/components/table/GenericTable.vue';
import DrawerTable from '@/components/table/DrawerTable.vue';
import DrawerForm from '@/components/form/DrawerForm.vue';
import dayjs from 'dayjs';
import FileUpload from "@/components/FileUpload";
import {numberRange} from "@/utils/formValidators";

export default {
  name: "ProdStock",
  components: {GenericTable, DrawerForm, FileUpload, ModalTable: DrawerTable},
  data() {
    return {
      loading: false,
      tableData: [],
      detailtableData: [],
      detailDrawerOpen: false,
      formDrawerOpen: false,
      currentEditRecord: null, // null 表示新增，非 null 表示编辑
      saving: false,
      columnsStock: [
        {title: '产品ID', dataIndex: 'pid', key: 'pid', fixed: 'left', width: 80},
        {title: '用户ID', dataIndex: 'uid', key: 'uid'},
        {title: '产品名称', dataIndex: 'pname', key: 'pname'},
        {title: '产品信息', dataIndex: 'info', key: 'info'},
        {title: '创建时间', dataIndex: 'c_date', key: 'c_date'},
        {title: '库存', dataIndex: 'quantity', key: 'quantity', type: 'number'},
        {title: '操作', key: 'action', slotName: 'action', fixed: 'right', width: 120}
      ],
      columnsStockLog: [
        {title: '产品ID', dataIndex: 'pid', key: 'pid', type: 'select', showInEdit: false},
        {title: '产品名称', dataIndex: 'pname', key: 'pname', showInAdd: false, showInEdit: false},
        {
          title: '操作类型', dataIndex: 'op_type', key: 'op_type', type: 'radio', required: true,
          options: [{label: '出库', value: 2}, {label: '入库', value: 1}], slotName: 'op_type'
        },
        {title: '操作用户ID', dataIndex: 'op_uid', key: 'op_uid', showInAdd: false, showInEdit: false},
        {title: '操作数量', dataIndex: 'op_num', key: 'op_num', type: 'number', rules: [numberRange({min: 1})]},
        {title: '操作附言', dataIndex: 'note', key: 'note'},
        {title: '操作时间', dataIndex: 'c_time', key: 'c_time', showInAdd: false, showInEdit: false},
      ],
    }
  },
  computed: {
    isAddMode() {
      return this.currentEditRecord === null;
    },

    formItemsForDrawer() {
      return this.columnsStockLog.filter(col => {
        if (!col.dataIndex) return false;
        if (this.isAddMode) return col.showInAdd !== false;
        return true
      });
    },

    initialValuesForDrawer() {
      if (this.isAddMode) {
        const values = {};
        // this.columnsStockLog.forEach(col => {
        //   if (col.dataIndex && col.showInAdd !== false) {
        //     values[col.dataIndex] = col.defaultValue ?? '';
        //   }
        // });
        return values;
      } else {
        // todo
        return {...this.currentEditRecord};
      }
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        await this.$api.get('StockQuery').then(response => {
          this.tableData = response.data
        })

        const prodData = await this.$api.get('ProdQuery')
        this.columnsStockLog[0].options = prodData.data.map(item => ({
          value: item.pid,
          label: item.pid + '-' + item.pname
        }))

      } catch (error) {
        console.error('refreshData failed:', error);
      } finally {
        this.loading = false;
      }
    },

    showEditForm(record) {
      this.currentEditRecord = {...record};
      this.formDrawerOpen = true;
    },

    async showStockLog(record) {
      this.detailDrawerOpen = true;
      this.loading = true
      try {
        await this.$api.get('StockLogQuery', {'pid': record.pid}).then(response => {
          this.detailtableData = response.data
        })
      } catch (error) {
        console.error('showStockLog failed:', error);
      } finally {
        this.loading = false
      }
    },

    showAddForm() {
      this.currentEditRecord = null;
      this.formDrawerOpen = true;
    },

    handleParse(parseRes) {
      this.handleFormSubmit(parseRes.data.data)
    },

    async handleFormSubmit(formData) {
      const api = formData.op_type === 1 ? 'StockIn' : 'StockOut';
      const currentUser = JSON.parse(localStorage.getItem('user'));
      formData['op_uid'] = currentUser.uid
      if (!api) {
        this.formDrawerOpen = false;
        return;
      }

      this.saving = true;
      try {
        await this.$api.request(api, {...formData});
        this.$message.success('操作成功');
        this.refreshData();
        this.formDrawerOpen = false;
      } catch (error) {
        this.$message.error('操作失败');
      } finally {
        this.saving = false;
      }
    },

    handleFormCancel() {
      this.formDrawerOpen = false;
      this.currentEditRecord = null;
      this.detailtableData = [];
    },

    formatValue(value, type) {
      if (value == null) return '';
      if (type === 'date' || type === 'datetime') {
        const d = dayjs(value);
        if (d.isValid()) {
          return d.format(type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
        }
        return '';
      }
      // 特殊处理标签列表
      if (Array.isArray(value)) {
        return value.map(item => item.tname).join(' | ')
      }

      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
  },
  created() {
    this.refreshData()
  }
}
</script>

<style scoped>
.prod-stock-container {
  padding: 2px;
  height: 100%;
  box-sizing: border-box;
}
</style>
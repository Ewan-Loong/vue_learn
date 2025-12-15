<template>
  <div class="frontend-search-table">
    <!-- 全局搜索框 -->
    <a-input-search
        v-model:value="globalSearchText"
        placeholder="搜索所有字段..."
        allow-clear
        enter-button
        style="width: 300px; margin-bottom: 16px"
        @search="handleSearch"
    />

    <!-- 表格 -->
    <a-table
        :columns="computedColumns"
        :data-source="paginatedData"
        :pagination="paginationConfig"
        :loading="loading"
        :scroll="{ y: '50vh', x: 'max-content' }"
        size="small"
        table-layout="fixed"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
    >
      <template #bodyCell="{ column, text }">
        <div v-if="column.key !== 'action'" class="cell-wrap">
          {{ typeof text === 'object' ? JSON.stringify(text) : text }}
        </div>
      </template>

      <template #action="{ record }">
        <a-button type="link" size="small" @click.stop="showDetail(record)">
          详情
        </a-button>
      </template>
    </a-table>

    <!-- 详情抽屉 -->
    <a-drawer
        v-if="drawerVisible"
        title="详情"
        placement="right"
        width="640"
        :visible="true"
        @close="closeDrawer"
        :destroy-on-close="true"
    >
      <a-descriptions
          v-if="currentRecord"
          bordered
          size="middle"
          :column="1"
          layout="vertical"
      >
        <a-descriptions-item
            v-for="key in Object.keys(currentRecord)"
            :key="key"
            :label="key"
        >
          {{ currentRecord[key] }}
        </a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script>
export default {
  name: 'BasicTable',
  props: {
    apiId: {type: String, required: true},
    showAction: {type: Boolean, default: true},
    excludeFields: {type: Array, default: () => []},
  },

  data() {
    return {
      loading: false,
      rawData: [], // 原始完整数据（用于前端搜索）
      allKeys: [],

      globalSearchText: '',
      filteredData: [], // 搜索后的数据

      paginationConfig: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50'],
      },

      drawerVisible: false,
      currentRecord: null,
    };
  },

  computed: {
    visibleKeys() {
      return this.allKeys.filter(key => !this.excludeFields.includes(key));
    },

    computedColumns() {
      const cols = this.visibleKeys.map(key => ({
        title: key,
        dataIndex: key,
        key: key,
        sorter: (a, b) => {
          const aVal = a[key];
          const bVal = b[key];
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return aVal - bVal;
          }
          return String(aVal).localeCompare(String(bVal));
        },
        ellipsis: true,
        resizable: true,
      }));

      if (this.showAction) {
        cols.push({
          title: '操作',
          key: 'action',
          width: 100,
          fixed: 'right',
          slots: {customRender: 'action'},
        });
      }
      return cols;
    },

    // 前端搜索 + 分页
    paginatedData() {
      const start = (this.paginationConfig.current - 1) * this.paginationConfig.pageSize;
      const end = start + this.paginationConfig.pageSize;
      return this.filteredData.slice(start, end);
    },
  },

  watch: {
    filteredData: {
      // 监测到数据变化时重新分页
      handler() {
        this.resetPagination();
      },
      immediate: true,
    },
  },

  created() {
    this.loadDataFromApi();
  },

  methods: {
    async loadDataFromApi() {
      this.loading = true;
      try {
        // const res = await this.$api.request(this.apiId);
        // {page: 1,size: 10000 } 数据量不大1万条的情况下可以使用前端搜索
        const res = {
          'data': [
            {'id': 1, 'name': 'Ann', 'birthdt': '2000-01-09'},
            {'id': 2, 'name': 'Ben', 'birthdt': '2001-03-12'},
            {'id': 3, 'name': 'Cara', 'birthdt': '2001-05-27'},
            {'id': 4, 'name': 'Ann', 'birthdt': '2000-01-09'},
            {'id': 5, 'name': 'Ben', 'birthdt': '2001-03-12'},
            {'id': 6, 'name': 'Cara', 'birthdt': '2001-05-27'},
            {'id': 7, 'name': 'Ann', 'birthdt': '2000-01-09'},
            {'id': 8, 'name': 'Ben', 'birthdt': '2001-03-12'},
            {'id': 9, 'name': 'Cara', 'birthdt': '2001-05-27'},
            {'id': 10, 'name': 'Cara', 'birthdt': '2001-05-27'},
            {'id': 11, 'name': 'Ann', 'birthdt': '2000-01-09'},
            {'id': 12, 'name': 'Ben', 'birthdt': '2001-03-12'},
            {'id': 13, 'name': 'Cara', 'birthdt': '2001-05-27'}
          ]
        }

        this.rawData = res.data || [];
        this.filteredData = [...this.rawData];

        if (this.allKeys.length === 0 && this.rawData.length > 0) {
          this.allKeys = Object.keys(this.rawData[0]).filter(
              key => typeof this.rawData[0][key] !== 'function'
          );
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        this.rawData = [];
        this.filteredData = [];
      } finally {
        this.loading = false;
      }
    },

    applySearch() {
      const searchText = this.globalSearchText.trim().toLowerCase();
      if (!searchText) {
        this.filteredData = [...this.rawData];
        return;
      }

      this.filteredData = this.rawData.filter(item => {
        return this.visibleKeys.some(key => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchText);
        });
      });
    },

    resetPagination() {
      this.paginationConfig = {
        ...this.paginationConfig,
        current: 1,
        total: this.filteredData.length,
      };
    },

    handleSearch() {
      this.applySearch();
      // this.resetPagination();
    },

    handleTableChange(pagination) {
      this.paginationConfig = {
        ...this.paginationConfig,
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: this.filteredData.length,
      };
    },

    showDetail(record) {
      this.currentRecord = {...record};
      this.drawerVisible = true;
    },

    closeDrawer() {
      this.drawerVisible = false;
      this.currentRecord = null;
    },
  },
};
</script>

<style scoped>
.frontend-search-table {
  max-height: 75vh;
  padding: 16px;
}

.cell-wrap {
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  padding: 8px 12px;
}

/* 斑马纹 */
/*:deep(.ant-table-tbody > tr:nth-child(even)) {*/
/*  background-color: #fafafa;*/
/*}*/
</style>
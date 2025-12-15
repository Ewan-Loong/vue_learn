<template>
  <div class="standard-table-container">
    <div class="toolbar">
      <!-- 工具栏插槽 -->
      <div class="toolbar-left-slot" v-if="$slots['toolbar-left']">
        <slot name="toolbar-left" :data="paginatedData" :columns="finalColumns"></slot>
      </div>

      <!-- 全局搜索框 -->
      <a-input-search
          v-model:value="globalSearchText"
          placeholder="搜索所有字段..."
          allow-clear
          enter-button
          style="width: 300px;"
          @search="handleSearch"
      />

      <!-- 工具栏右侧插槽 -->
      <div class="toolbar-right-slot" v-if="$slots['toolbar-right']">
        <slot name="toolbar-right" :data="paginatedData"></slot>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper" ref="tableWrapperRef">
      <a-table
          class="standard-table"
          :columns="finalColumnsWithSlots"
          :data-source="paginatedData"
          :pagination="false"
          :loading="loading"
          :virtual="paginatedData.length > 1000"
          size="small"
          table-layout="fixed"
          @change="handleTableChange"
          :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
          :scroll="{ y: tableMaxHeight, x: totalColumnWidth }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 列插槽：优先使用插槽，否则使用默认渲染 -->
          <template v-if="column.slotName">
            <slot
                :name="column.slotName"
                :record="record"
                :column="column"
                :value="record[column.dataIndex]"
                :index="paginatedData.indexOf(record)"
            ></slot>
          </template>

          <!-- 其他列：默认渲染 -->
          <template v-else>
            <div class="cell-wrap">
              <template v-if="column.type === 'date' || column.type === 'datetime'">
                {{ formatValue(record[column.dataIndex], column.type) }}
              </template>
              <template v-else>
                {{
                  typeof record[column.dataIndex] === 'object' && record[column.dataIndex] !== null
                      ? JSON.stringify(record[column.dataIndex])
                      : record[column.dataIndex]
                }}
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 手动分页器 -->
    <a-pagination
        v-bind="innerPagination"
        @change="handleTableChange"
        @showSizeChange="handlePageSizeChange"
        class="standard-table-pagination"
    />

    <!-- 底部插槽 -->
    <div class="table-bottom-slot" v-if="$slots.bottom">
      <slot
          name="bottom"
          :data="paginatedData"
          :pagination="innerPagination"
          :filtered-data="filteredData"
      ></slot>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'GenericTable',
  props: {
    rawData: {type: Array, required: true, default: () => []},
    rawColumns: {type: Array, required: true, default: () => []},
    loading: {type: Boolean, default: false},
  },

  data() {
    return {
      globalSearchText: '',
      filteredData: [],
      innerPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5','10', '20', '50'],
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
      },
      tableMaxHeight: 300, // 默认高度
      resizeObserver: null,
      resizeTimer: null,
      pendingHeightUpdate: false,
    };
  },

  computed: {
    searchableKeys() {
      return this.rawColumns
          .map(col => col.dataIndex)
          .filter(key => key != null && key !== '');
    },

    finalColumnsWithSlots() {
      return [
        ...this.rawColumns.map(col => {
          const field = col.dataIndex || col.key;
          return {
            ...col,
            sorter: (a, b) => {
              const aVal = a[field];
              const bVal = b[field];
              if (typeof aVal === 'number' && typeof bVal === 'number') {
                return aVal - bVal;
              }
              return String(aVal ?? '').localeCompare(String(bVal ?? ''));
            },
          };
        }),
      ];
    },

    paginatedData() {
      const start = (this.innerPagination.current - 1) * this.innerPagination.pageSize;
      return this.filteredData.slice(start, start + this.innerPagination.pageSize);
    },

    totalColumnWidth() {
      return this.finalColumnsWithSlots.reduce((sum, col) => {
        return sum + (col.width || 100);
      }, 0);
    }
  },

  watch: {
    rawData: {
      handler(newVal) {
        this.applySearchTo(newVal);
        this.resetPagination();
        this.$nextTick(() => {
          this.scheduleHeightUpdate();
        });
      },
      immediate: true,
    },
  },

  mounted() {
    this.initResizeObserver();
    this.scheduleHeightUpdate();
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
  },

  methods: {
    initResizeObserver() {
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.scheduleHeightUpdate();
        });
        if (this.$refs.tableWrapperRef) {
          this.resizeObserver.observe(this.$refs.tableWrapperRef);
        }
      } else {
        window.addEventListener('resize', this.scheduleHeightUpdate);
      }
    },

    scheduleHeightUpdate() {
      if (this.pendingHeightUpdate) return;
      this.pendingHeightUpdate = true;
      requestAnimationFrame(() => {
        this.computeTableHeight();
        this.pendingHeightUpdate = false;
      });
    },

    computeTableHeight() {
      const wrapper = this.$refs.tableWrapperRef;
      if (!wrapper || !wrapper.offsetParent) return;

      const height = wrapper.clientHeight;
      if (height <= 0) return;

      const headerHeight = 32;
      const safeMargin = 8;
      const calculated = height - headerHeight - safeMargin;

      this.tableMaxHeight = Math.max(100, calculated);
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
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    },

    applySearchTo(data) {
      data = Array.isArray(data) ? data : [];

      const term = this.globalSearchText.trim().toLowerCase();
      if (!term) {
        this.filteredData = [...data];
        return;
      }
      this.filteredData = data.filter(item =>
          this.searchableKeys.some(key => {
            const val = item[key];
            return val != null && String(val).toLowerCase().includes(term);
          })
      );

      this.$nextTick(() => {
        this.scheduleHeightUpdate();
      });
    },

    handleSearch() {
      this.applySearchTo(this.rawData);
      this.resetPagination();
    },

    resetPagination() {
      this.innerPagination.current = 1;
      this.innerPagination.total = this.filteredData.length;
    },

    handlePageSizeChange(current, size) {
      this.innerPagination.current = current;
      this.innerPagination.pageSize = size;
    },

    handleTableChange(current) {
      // 直接修改 current 属性
      this.innerPagination.current = current;
      this.$nextTick(() => {
        this.scheduleHeightUpdate();
      });
    },
  },
};
</script>

<style scoped>
.standard-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: 12px;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
  align-items: center;
}

.toolbar-left-slot {
  flex: 1;
  display: flex;
  gap: 8px;
}

.toolbar-right-slot {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.table-bottom-slot {
  margin-top: 16px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.standard-table {
  width: 100%;
}

.standard-table-pagination {
  margin-top: 8px;
  flex-shrink: 0;
  display: flex;
  justify-content: right;
}

.cell-wrap {
  word-break: break-word;
  line-height: 1.5;
  padding: 8px 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  box-sizing: border-box;
}

:deep(.table-striped) {
  background-color: #fafafa;
}

:deep(.ant-table-thead .ant-table-cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>